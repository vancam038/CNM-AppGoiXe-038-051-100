var express = require('express');

var requestRepo = require('../repos/requestRepo');
var router = express.Router();

router.get('/requests', (req, res) => {
    requestRepo.loadAll()
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
    requestRepo.add(req.body)
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