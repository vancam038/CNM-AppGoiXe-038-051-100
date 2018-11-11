var express = require('express');

var locationIndetifierRepo = require('../repos/locationIndetifierRepo');
var router = express.Router();

router.get('/requests', (req, res) => {
    locationIndetifierRepo.loadAll()
        .then(rows => {
            res.json(rows);
        }).catch(err => {
            console.log(err);
            res.statusCode = 500;
            res.end('View error log on console');
        })
});

module.exports = router;