const express = require('express');
const pgPromise = require('pg-promise');
const app = express();
const port = 8080;

const CONNINFO = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
};

const db = pgPromise()(CONNINFO);

app.set('view engine', 'pug');

var pixel = Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');

async function recordReceipt(receipt, record) {
    await db.none('INSERT INTO receipt_records(receipt, record) VALUES(${receipt}, ${record})', {
        receipt,
        record
    });   
}

async function receiptExists(receipt) {
    // Check if receipt already exists in the DB
    return (await db.any('SELECT * FROM receipts WHERE name = ${receipt}', {
        receipt
    })).length > 0;
}

async function createReceipt(receipt) {
    // Create the receipt name in the DB
    await db.none('INSERT INTO receipts(name) VALUES(${receipt})', {
        receipt
    });
}

async function getReceiptStats(receipt) {
    // get receipt stats from the DB
    return db.any('SELECT * FROM receipt_records WHERE receipt = ${receipt}', {
        receipt
    });
}

async function getAllStats() {
    // get receipt stats from the DB
    return db.any('SELECT * FROM receipt_records');
}

app.get("/stats", async function(req, res) {
    const receipt = req.params.receipt;

    const stats = await getAllStats();

    res.render('index', { stats, path: req.path.replace(/\/$/, '') });
});

app.get("/stats/:receipt", async function(req, res) {
    const receipt = req.params.receipt;

    if (!await receiptExists(receipt)) {
        return res.status(404).send('Receipt not found');
    }

    const stats = await getReceiptStats(receipt);

    res.render('index', { stats, path: req.path.replace(`/${receipt}`, '') });
});

app.get('/:receipt', async function(req, res) {
    const receipt = req.params.receipt;

    if (!await receiptExists(receipt)) {
        return res.status(404).send('Receipt not found');
    }

    await recordReceipt(receipt, JSON.stringify(req.headers));

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': pixel.length
    });

    res.end(pixel);
});

app.get("/create/:receipt", async function(req, res) {
    const receipt = req.params.receipt;

    if (await receiptExists(receipt)) {
        return res.status(409).send('Already exists');
    }

    await createReceipt(receipt)

    res.status(200).send('Receipt successfully created');
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

