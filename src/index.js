require('dotenv').config({ path: 'database.env' });
const path = require('path');
const express = require('express');
const pgPromise = require('pg-promise');
const { requiresAuth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASEURL,
  clientID: 'ZUUQSwOBPlXbALIc1Rb2VTVZCaZmSFvp',
  issuerBaseURL: 'https://litcodes.us.auth0.com'
};

const app = express();
const port = 8080;

app.use(auth(config));

const CONNINFO = {
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};

const db = pgPromise()(CONNINFO);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const pixel = Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');

async function recordReceipt(receipt, record) {
  await db.none('INSERT INTO receipt_records(receipt, record) VALUES(${receipt}, ${record})', {
    receipt,
    record,
  });
}

async function receiptExists(receipt) {
  // Check if receipt already exists in the DB
  return (await db.any('SELECT * FROM receipts WHERE name = ${receipt}', {
    receipt,
  })).length > 0;
}

async function createReceipt(receipt) {
  // Create the receipt name in the DB
  await db.none('INSERT INTO receipts(name) VALUES(${receipt})', {
    receipt,
  });
}

async function getReceiptStats(receipt) {
  // get receipt stats from the DB
  return db.any('SELECT * FROM receipt_records WHERE receipt = ${receipt}', {
    receipt,
  });
}

async function getAllStats() {
  // get receipt stats from the DB
  return db.any('SELECT * FROM receipt_records');
}

app.get('/stats', requiresAuth(), async (req, res) => {
  console.log(JSON.stringify(req.oidc.user));
  const stats = await getAllStats();

  res.render('index', { stats, path: req.path.replace(new RegExp('/+$'), '') });
});

app.get('/stats/:receipt', requiresAuth(), async (req, res) => {
  console.log(JSON.stringify(req.oidc.user));
  const { receipt } = req.params;

  if (!await receiptExists(receipt)) {
    return res.status(404).send('Receipt not found');
  }

  const stats = await getReceiptStats(receipt);

  res.render('index', { stats, path: req.path.replace(new RegExp(`/+${receipt}`), '') });
});

app.get('/:receipt', async (req, res) => {
  const { receipt } = req.params;

  if (!await receiptExists(receipt)) {
    return res.status(404).send('Receipt not found');
  }

  await recordReceipt(receipt, JSON.stringify(req.headers));

  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': pixel.length,
  });

  res.end(pixel);
});

app.get('/create/:receipt', requiresAuth(), async (req, res) => {
  console.log(JSON.stringify(req.oidc.user));
  const { receipt } = req.params;

  if (!await receiptExists(receipt)) {
    await createReceipt(receipt);
  }

  res.status(200).render('create', { receipt, path: req.path.replace(new RegExp(`/+create/+${receipt}`), '') });
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
