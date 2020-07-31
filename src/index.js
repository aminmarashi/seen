const express = require('express');
const app = express();
const port = 8080;

app.set('view engine', 'pug');

var pixel = Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');

function recordReceipt(receipt, payload) {
    // Insert the visitor of the receipt to the DB
}

function receiptExists(receipt) {
    // Check if receipt already exists in the DB
    return true;
}

function createReceipt(receipt) {
    // Create the receipt name in the DB
}

function getReceiptStats(receipt) {
    // get receipt stats from the DB
    return [
        'a','b'
    ];
}

app.get("/:receipt", function(req, res) {
    const receipt = req.params.receipt;

    if (!receiptExists(receipt)) {
        res.status(404).send('Receipt not found');
    }

    recordReceipt(receipt, JSON.stringify(req.headers));

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': pixel.length
    });

    res.end(pixel);
});

app.get("/stats/:receipt", function(req, res) {
    const receipt = req.params.receipt;

    if (!receiptExists(receipt)) {
        res.status(404).send('Receipt not found');
    }

    const stats = getReceiptStats(receipt);

    return res.render('index', { stats });
});

app.get("/create/:receipt", function(req, res) {
    const receipt = req.params.receipt;

    if (!receiptExists(receipt)) {
        res.status(409).send('Already exists');
    }

    createReceipt(receipt)

    res.status(200).send('Receipt successfully created');
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

