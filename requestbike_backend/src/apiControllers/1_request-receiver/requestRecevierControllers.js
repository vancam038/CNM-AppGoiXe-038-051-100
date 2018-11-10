var express = require('express');

var requestReceiverRepo = require('../../repos/requestReceiverRepo');
var router = express.Router();

router.get('/request', (req, res) => {
    requestReceiverRepo.loadAll()
        .then(rows => {
            res.json(rows);
        }).catch(err => {
            console.log(err);
            res.statusCode = 500;
            res.end('View error log on console');
        })
});

router.post('/request', (req, res) => {
    console.log('body: ' + req.body);
    requestReceiverRepo.add(req.body)
        .then(value => {
            console.log(value);
            res.statusCode = 201;
            res.json(req.body);
        })
        .catch(err => {
            console.log(err);
            res.statusCode = 500;
            res.end('View error log on console');
        })
})

module.exports = router;