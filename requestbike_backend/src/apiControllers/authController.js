var express = require('express');
var uid = require('rand-token').uid;
var authRepo = require('../repos/authRepo');

var router = express.Router();

//Add new user
router.post('/user', (req, res) => {
    var id = uid(10);
    authRepo.add(req.body, id)
        .then(value => {
            console.log(value);
            res.statusCode = 201;
            res.json(req.body);

            // nếu type = 4 <=> người dùng là driver
            // add tiếp vào table driver
            if (req.body.Type == 4) {
                const driverId = id;
                const driverName = req.body.Name;
                const driverPhone = req.body.Phone;
                const driverStatus = "STANDBY";
                const driverObject = {
                    driverId,
                    driverName,
                    driverStatus,
                    driverPhone
                }
                authRepo.addDriver(driverObject)
                    .then(console.log("added new driver"))
                    .catch(err => {
                        console.log(err);
                    })
            }

        })
        .catch(err => {
            console.log(err);
            res.statusCode = 500;
            res.end('View error log on console');
        })
});

router.post('/login', (req, res) => {
    authRepo.login(req.body)
        .then(rows => {
            if (rows.length > 0) {
                var userEntity = rows[0];
                var acToken = authRepo.generateAccessToken(userEntity);
                var rfToken = authRepo.generateRefreshToken();

                authRepo.updateRefreshToken(userEntity.f_id, rfToken)
                    .then(value => {
                        res.json({
                            auth: true,
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