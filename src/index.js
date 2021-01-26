require('dotenv').config({ path: 'database.env' });
const path = require('path');
const express = require('express');
const pgPromise = require('pg-promise');
const { auth, requiresAuth } = require('express-openid-connect');

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

async function recordReceipt(user_id, receipt, record) {
  await db.none('INSERT INTO receipt_records(receipt_id, record) VALUES((SELECT id FROM receipts WHERE user_id = ${user_id} and name = ${receipt}), ${record})', {
    receipt,
    record,
    user_id,
  });
}

async function receiptExists(user_id, receipt) {
  return (await db.any('SELECT * FROM receipts WHERE user_id = ${user_id} AND name = ${receipt}', {
    receipt,
    user_id,
  })).length > 0;
}

async function getOrCreateUser(email) {
  const id = await db.any('SELECT id FROM users WHERE email = ${email}', {
    email,
  });
  if (id.length) return id[0].id;
  return await db.any('INSERT INTO users(email) VALUES(${email}) ON CONFLICT DO NOTHING RETURNING id', {
    email,
  })[0].id;
}

async function createReceipt(user_id, receipt) {
  // Create the receipt name in the DB
  await db.none('INSERT INTO receipts(user_id, name) VALUES(${user_id}, ${receipt})', {
    receipt,
    user_id,
  });
}

async function getReceiptStats(user_id, receipt) {
  // get receipt stats from the DB
  return db.any('SELECT receipts.name as receipt, receipt_records.* FROM receipt_records LEFT JOIN receipts ON receipt_id = id WHERE user_id = ${user_id} AND receipts.name = ${receipt}', {
    receipt,
    user_id,
  });
}

async function getAllStats(user_id) {
  // get receipt stats from the DB
  return db.any('SELECT receipts.name as receipt, receipt_records.* FROM receipt_records LEFT JOIN receipts ON receipt_id = id WHERE user_id = ${user_id}', {
    user_id,
  });
}

app.get('/stats', requiresAuth(), async (req, res) => {
  const { email } = req.oidc.user;
  const user_id = await getOrCreateUser(email);
  const stats = await getAllStats(user_id);

  res.render('index', { user: req.oidc.user, stats, path: '' });
});

app.get('/stats/:receipt', requiresAuth(), async (req, res) => {
  const { email } = req.oidc.user;
  const { receipt } = req.params;

  const user_id = await getOrCreateUser(email);
  if (!await receiptExists(user_id, receipt)) {
    return res.status(404).send('Receipt not found');
  }

  const stats = await getReceiptStats(user_id, receipt);

  res.render('index', { user: req.oidc.user, stats, path: req.path.replace(new RegExp(`/+${receipt}`), '') });
});

app.get('/create/:receipt', requiresAuth(), async (req, res) => {
  const { email } = req.oidc.user;
  const { receipt } = req.params;

  const user_id = await getOrCreateUser(email);
  if (!await receiptExists(user_id, receipt)) {
    await createReceipt(user_id, receipt);
  }

  res.status(200).render('create', { user: req.oidc.user, receipt, path: `/${user_id}` });
});

app.get('/:user_id/:receipt', async (req, res) => {
  const { receipt, user_id } = req.params;

  if (!await receiptExists(user_id, receipt)) {
    return res.status(404).send('Receipt not found');
  }

  await recordReceipt(user_id, receipt, JSON.stringify(req.headers));

  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': pixel.length,
  });

  res.end(pixel);
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
