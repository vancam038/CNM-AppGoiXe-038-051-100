var db = require('../fn/mysql-db');

exports.add = requestEntity => {
	var sql = `insert into request(clientName, phone, address, note, status) values('${requestEntity.clientName}', '${requestEntity.phone}', '${requestEntity.address}', '${requestEntity.note}', '${requestEntity.status}')`;
	return db.save(sql);
}

exports.loadAll = () => {
	var sql = `select * from request`;
	return db.load(sql);
}