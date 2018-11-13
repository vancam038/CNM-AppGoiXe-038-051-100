var db = require("../fn/mysql-db");
const request = require("request-promise");

exports.add = requestEntity => {
  const {
    id,
    clientName,
    phone,
    address,
    note,
    status: statusNote
  } = requestEntity;
  const trimmedAddress = encodeURI(address.replace(" ", "+"));
  const opt = {
    uri: `https://maps.googleapis.com/maps/api/geocode/json?address=${trimmedAddress}&key=AIzaSyDas6_Z8AZ6sdYJGOucYDWh-MCcoB9jjVE`,
    headers: {
      "User-Agent": "Request-Promise"
    },
    json: true
  };

  request(opt)
    .then(res => {
      const { lat, lng } = res.results[0].geometry.location,
        { status } = res;
      if (status !== "OK") {
        console.log("STATUS: ", status);
        return Promise.reject();
      }
      const sql =
        "insert into `request`(`id`, `clientName`, `phone`, `address`, `note`, `status`, `lat`, `lng`)" +
        `values(${id},${clientName},${phone},'${address}',${note},'${statusNote}',${lat},${lng})`;
      console.log(sql);
      return db.save(sql);
    })
    .catch(err => {
      // console.log(err);
      return Promise.reject(err);
    });
};

exports.loadAll = () => {
  var sql = `select * from request`;
  return db.load(sql);
};

// duy-th start
exports.updatePassengerPosition = (newLatLng, reqId) => {
  const sql = `update request set lat = ${newLatLng.lat}, lng = ${
    newLatLng.lng
  } where id=${reqId}`;
  return db.save(sql);
};

exports.getReqCoords = reqId => {
  const sql = `select lat, lng from request where id = ${reqId}`;
  return db.load(sql);
};
// duy-th end
