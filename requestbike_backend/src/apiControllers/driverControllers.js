var express = require("express");
const request = require("request-promise");
const shortid = require("shortid");
var _ = require('lodash');

var driverRepo = require("../repos/driverRepo");
var router = express.Router();

router.patch("/status", (req, res) => {
  const driverId = req.body.driverId;
  const newStatus = req.body.status;
  
  if (!driverId || !newStatus) {
    res.statusCode = 500;
    res.end();
  }

  driverRepo
    .updateStatus(newStatus, driverId)
    .then(result => {
      console.log(result);
      res.statusCode = 201;
      res.json({
        status: "OK"
      });
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.end("View error log on console");
    });
});

module.exports = router;