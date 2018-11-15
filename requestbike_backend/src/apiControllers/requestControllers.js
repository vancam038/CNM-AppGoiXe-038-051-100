var express = require("express");
const request = require("request-promise");
const shortid = require("shortid");
var moment = require('moment');
var _ = require('lodash');

var requestRepo = require("../repos/requestRepo");
var router = express.Router();

router.get("/requests", (req, res) => {
  requestRepo
    .loadAll()
    .then(rows => {
      res.statusCode = 200;
      // res.json(rows);
      res.send(_.sortBy(JSON.parse(JSON.stringify(rows)), [function (o) {
        return o.date_submitted;
      }]).reverse());
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.end("View error log on console");
    });
});

router.get("/requests/:status", (req, res) => {
  const reqStatus = req.params.status.trim().toLowerCase();
  switch (reqStatus) {
    case "unidentified":
      requestRepo
        .loadUnidentified()
        .then(rows => {
          res.statusCode = 200;
          res.json(rows);
        })
        .catch(err => {
          console.log(err);
          res.statusCode = 500;
          res.end("View error log on console");
        });
      break;
    default:
      res.statusCode = 404;
      res.json({
        status: "INVALID_REQUEST_TYPE"
      });
      break;
  }
});

router.post("/request", (req, res) => {
  const _req = req.body;
  const {
    address
  } = _req;
  const trimmedAddress = encodeURI(address.replace(" ", "+").trim());
  const opt = {
    uri: `https://maps.googleapis.com/maps/api/geocode/json?address=${trimmedAddress}&key=AIzaSyDas6_Z8AZ6sdYJGOucYDWh-MCcoB9jjVE`,
    headers: {
      "User-Agent": "Request-Promise"
    },
    json: true
  };

  request(opt).then(resp => {
    const {
      lat,
      lng
    } = resp.results[0].geometry.location, {
      status
    } = resp;
    if (status !== "OK") {
      console.log("STATUS: ", status);
      res.statusCode = 500;
      res.json({
        status: "ZERO_RESULTS"
      });
    }
    _req.id = shortid.generate();
    _req.lat = lat;
    _req.lng = lng;
    requestRepo
      .add(_req)
      .then(() => {
        res.statusCode = 201;
        res.json(req.body);
      })
      .catch(err => {
        console.log(err);
        res.statusCode = 500;
        res.json({
          status: "UNKNOWN_ERROR",
          message: err
        });
      });
  });
});

router.get("/request/coords/:reqId", (req, res) => {
  const reqId = req.params.reqId;
  requestRepo
    .getCoords(reqId)
    .then(value => {
      if (value.length > 0) {
        res.statusCode = 200;
        res.json({
          status: "OK",
          coords: value[0]
        });
      } else {
        res.statusCode = 404;
        res.json({
          status: "NOT_FOUND"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.json({
        status: "UNKNOWN_ERROR",
        message: err
      });
    });
});

router.patch("/request/coords", (req, res) => {
  const {
    reqId,
    newLat,
    newLng
  } = req.body;
  if (!reqId || !newLat || !newLng) {
    res.statusCode = 500;
    res.end();
  }

  requestRepo
    .updateCoords(newLat, newLng, reqId)
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

router.patch("/request/status", (req, res) => {
  const reqId = req.body.reqId;
  console.log(req.body.status);
  const newStatus = req.body.status;
  if (!reqId || !newStatus) {
    res.statusCode = 500;
    res.end();
  }

  requestRepo
    .updateStatus(newStatus, reqId)
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