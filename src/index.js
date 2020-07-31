const express = require('express');
const pgPromise = require('pg-promise');
const app = express();
const port = 8080;

const CONNINFO = {
    host: process.ENV.DB_HOST,
    port: process.ENV.DB_PORT,
    database: process.ENV.DB_NAME,
    user: process.ENV.DB_USER,
    password: process.ENV.DB_PASS,
};

const db = pgPromise(CONNINFO);

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
    return db.any('SELECT * FROM receipts WHERE name = ${receipt}', {
        receipt
    });
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

app.get("/:receipt", async function(req, res) {
    const receipt = req.params.receipt;

    if (!await receiptExists(receipt)) {
        res.status(404).send('Receipt not found');
    }

    await recordReceipt(receipt, JSON.stringify(req.headers));

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': pixel.length
    });

    res.end(pixel);
});

app.get("/stats/:receipt", async function(req, res) {
    const receipt = req.params.receipt;

    if (!await receiptExists(receipt)) {
        res.status(404).send('Receipt not found');
    }

    const stats = await getReceiptStats(receipt);

    return res.render('index', { stats });
});

app.get("/create/:receipt", async function(req, res) {
    const receipt = req.params.receipt;

    if (!await receiptExists(receipt)) {
        res.status(409).send('Already exists');
    }

    await createReceipt(receipt)

    res.status(200).send('Receipt successfully created');
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

