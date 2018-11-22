var express = require('express');
var uid = require('rand-token').uid;
var config = require('../config/config');
var userRepo = require('../repos/userRepo');

var router = express.Router();


router.post('/me',(req, res) => {
	let payload = req.token_payload;
	console.log(req.token_payload);
	res.json(payload);
});


module.exports = router;