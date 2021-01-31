require('dotenv').config({ path: 'database.env' });
const path = require('path');
const express = require('express');
const pgPromise = require('pg-promise');
const { auth, requiresAuth, attemptSilentLogin } = require('express-openid-connect');

const config = {
  attemptSilentLogin: false,
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
app.use(express.urlencoded());
app.use(express.json());

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

async function recordReceipt(receipt_id, record) {
  await db.none('INSERT INTO receipt_records(receipt_id, record) VALUES(${receipt_id}, ${record})', {
    receipt_id,
    record,
  });
}

async function getAllReceipts(email) {
  const user_id = await getOrCreateUser(email);
  return await db.any('SELECT * FROM receipts WHERE user_id = ${user_id}', {
    user_id,
  });
}

async function receiptExists(user_id, receipt_name) {
  const receipt = await db.any('SELECT * FROM receipts WHERE user_id = ${user_id} AND name = ${receipt_name}', {
    receipt_name,
    user_id,
  });
  if (receipt.length) return receipt[0];
  return undefined;
}

async function getReceiptById(receipt_id) {
  const receipt = await db.any('SELECT * FROM receipts WHERE id = ${receipt_id}', {
    receipt_id,
  });
  if (receipt.length) return receipt[0];
  return undefined;
}

async function getOrCreateUser(email) {
  const id = await db.any('SELECT id FROM users WHERE email = ${email}', {
    email,
  });
  if (id.length) return id[0].id;
  return (await db.any('INSERT INTO users(email) VALUES(${email}) ON CONFLICT DO NOTHING RETURNING id', {
    email,
  }))[0].id;
}

async function createReceipt(user_id, receipt_name) {
  const receipt = await receiptExists(user_id, receipt_name);
  if (receipt) return receipt.id;
  // Create the receipt name in the DB
  const newReceipt = await db.any('INSERT INTO receipts(user_id, name) VALUES(${user_id}, ${receipt_name}) RETURNING id', {
    receipt_name,
    user_id,
  });
  return newReceipt[0].id;
}

async function getReceiptStats(receipt_id) {
  // get receipt stats from the DB
  return db.any('SELECT receipts.name as receipt_name, receipts.id as receipt_id, receipt_records.* FROM receipt_records LEFT JOIN receipts ON receipt_id = id WHERE receipt_id = ${receipt_id} ORDER BY timestamp', {
    receipt_id,
  });
}

async function getReceiptStatsAfter(receipt_id, after) {
  // get receipt stats from the DB
  return db.any("SELECT receipts.name as receipt_name, receipts.id as receipt_id, receipt_records.* FROM receipt_records LEFT JOIN receipts ON receipt_id = id WHERE receipt_id = ${receipt_id} AND date_trunc('second', timestamp) > ${after} ORDER BY timestamp", {
    receipt_id,
    after,
  });
}

async function getAllStats(user_id) {
  // get receipt stats from the DB
  return db.any('SELECT receipts.name as receipt_name, receipts.id as receipt_id, receipt_records.* FROM receipt_records LEFT JOIN receipts ON receipt_id = id WHERE user_id = ${user_id} ORDER BY timestamp', {
    user_id,
  });
}

async function getAllStatsAfter(user_id, after) {
  // get receipt stats from the DB
  return db.any("SELECT receipts.name as receipt_name, receipts.id as receipt_id, receipt_records.* FROM receipt_records LEFT JOIN receipts ON receipt_id = id WHERE user_id = ${user_id}  AND date_trunc('second', timestamp) > ${after} ORDER BY timestamp", {
    user_id,
    after,
  });
}

app.get('/', async (req, res) => {
  res.render('index', { 
    title: 'Seen 👀',
    user: req.oidc.user,
  });
});

app.get('/track', requiresAuth(), async (req, res) => {
  const { email } = req.oidc.user;
  const user_id = await getOrCreateUser(email);
  const stats = await getAllStats(user_id);
  const receipts = await getAllReceipts(req.oidc.user.email);

  res.render('track', {
    title: 'Track a pixel🐕',
    user: req.oidc.user,
    receipts,
    stats,
    path: '/track',
  });
});

app.post('/track', requiresAuth(), async (req, res) => {
  const { email } = req.oidc.user;
  const user_id = await getOrCreateUser(email);
  const stats = await getAllStatsAfter(user_id, req.body.after);

  res.json({
    stats,
  });
});

app.post('/track/:receipt_id', requiresAuth(), async (req, res) => {
  const { receipt_id } = req.params;

  const receipt = await getReceiptById(receipt_id);
  if (!receipt) {
    return res.status(404).send('Receipt not found');
  }
  const stats = await getReceiptStatsAfter(receipt.id, req.body.after);

  res.json({
    stats,
  });
});

app.get('/track/:receipt_id', requiresAuth(), async (req, res) => {
  const { receipt_id } = req.params;

  const receipt = await getReceiptById(receipt_id);
  if (!receipt) {
    return res.status(404).send('Receipt not found');
  }

  const receipts = await getAllReceipts(req.oidc.user.email);
  const stats = await getReceiptStats(receipt.id);

  res.render('track', {
    title: `Track ${receipt.name}🐕`,
    receipt,
    receipts,
    user: req.oidc.user, 
    stats,
    path: `/track`,
  });
});

app.post('/create', requiresAuth(), async (req, res) => {
  const { email } = req.oidc.user;
  const { subject: receipt } = req.body;

  const user_id = await getOrCreateUser(email);
  const receiptId = await createReceipt(user_id, receipt);

  res.redirect(`/track/${receiptId}`);  
});

app.get('/create', requiresAuth(), async (req, res) => {
  res.render('create', { 
    title: 'Create a new pixel 🕵️‍♀️',
    user: req.oidc.user, 
  });
});

app.get('/:image', async (req, res) => {
  const { image } = req.params;
  
  const match = image.match(/(\d+).png/);
  if (!match) {
    return res.status(404).send('Receipt not found');
  }

  const receipt = await getReceiptById(match[1]);
  if (!receipt) {
    return res.status(404).send('Receipt not found');
  }
  
  if (!req.headers.referer || !req.headers.referer.match(/https:\/\/seen.lit.codes/)) {
    await recordReceipt(receipt.id, JSON.stringify(req.headers));
  }
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': pixel.length,
  });
  
  res.end(pixel);
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
