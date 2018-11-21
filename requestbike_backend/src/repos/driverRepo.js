var db = require("../fn/mysql-db");

// cam-sv start
exports.updateStatus = (newStatus, driverId) => {
  const sql =
    "update driver set status = " + `'${newStatus}'` + " where driverId=" + `'${driverId}';`;
  return db.save(sql);
};
// cam-sv end