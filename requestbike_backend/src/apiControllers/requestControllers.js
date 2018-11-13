var express = require("express");

var requestRepo = require("../repos/requestRepo");
var router = express.Router();

router.get("/requests", (req, res) => {
  requestRepo
    .loadAll()
    .then(rows => {
      res.json(rows);
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.end("View error log on console");
    });
});

// router.post("/request", (req, res) => {
//   console.log("body: " + req.body);
//   requestRepo
//     .add(req.body)
//     .then(value => {
//       console.log(value);
//       res.statusCode = 201;
//       res.json(req.body);
//     })
//     .catch(err => {
//       console.log(err);
//       res.statusCode = 500;
//       res.end("View error log on console");
//     });
// });

router.get("/getRequestCoords/:reqId", (req, res) => {
  const reqId = req.params.reqId;
  requestRepo
    .getReqCoords(reqId)
    .then(value => {
      if (value.length > 0) {
        res.statusCode = 200;
        res.json({ status: "OK", coords: value[0] });
      } else {
        res.statusCode = 404;
        res.json({ status: "NOT_FOUND" });
      }
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res, end("View error log on console");
    });
});

router.put("/request", (req, res) => {
  const { reqId, newLat, newLng } = req.body;
  if (!reqId || !newLat || !newLng) {
    res.statusCode = 500;
    res.end();
  }

  requestRepo
    .update(newLat, newLng, reqId)
    .then(result => {
      console.log(result);
      res.statusCode = 201;
      res.end();
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.end("View error log on console");
    });
});

module.exports = router;
