var db = require("../fn/mysql-db");

exports.add = requestEntity => {
  const {
    id,
    clientName,
    phone,
    address,
    note,
    status: statusReq,
    lat,
    lng
  } = requestEntity;

  const sql =
    "insert into `request`(`id`, `clientName`, `phone`, `address`, `note`, `status`, `lat`, `lng`)" +
    `values('${id}','${clientName}','${phone}','${address}','${note}','${statusReq}',${lat},${lng});`;
  return db.save(sql);
};

exports.loadAll = () => {
  var sql = `select * from request`;
  return db.load(sql);
};

// duy-th start
exports.update = (newLat, newLng, reqId) => {
  const sql =
    "update `request` set `lat` = " +
    `'${newLat}', ` +
    "`lng` = " +
    `'${newLng}' ` +
    "where `id`=" +
    `'${reqId}';`;
  return db.save(sql);
};

exports.getReqCoords = reqId => {
  const sql =
    "select `lat`, `lng` from `request` where `id` = " + `'${reqId}';`;
  return db.load(sql);
};
// duy-th end
