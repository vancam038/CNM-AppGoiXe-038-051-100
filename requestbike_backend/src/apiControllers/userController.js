var express = require('express');

var config = require('../config/config');
var userRepo = require('../repos/userRepo');
var authRepo = require('../repos/authRepo');

var router = express.Router();

router.post('/',())
router.post('/', (req, res) => {
	userRepo.add(req.body)
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
});

router.post('/me',(req, res) => {
	let payload = req.token_payload;
	console.log(req.token_payload);
	res.json(payload);
});
router.post('/login', (req, res) => {
	userRepo.login(req.body)
		.then(rows => {
			if (rows.length > 0) {
				var userEntity = rows[0];
				var acToken = authRepo.generateAccessToken(userEntity);
				var rfToken = authRepo.generateRefreshToken();

				authRepo.updateRefreshToken(userEntity.f_id, rfToken)
					.then(value => {
						res.json({
                            auth:true,
                            access_token: acToken,
                            refresh_token: rfToken,
                            type: userEntity.f_type
						})
					})
					.catch(err => {
						console.log(err);
						res.statusCode = 500;
						res.end('View error log on console');
					})
			} else {
				res.json({
					auth: false
				})
			}
		})
		.catch(err => {
			console.log(err);
			res.statusCode = 500;
			res.end('View error log on console');
		})
});

module.exports = router;