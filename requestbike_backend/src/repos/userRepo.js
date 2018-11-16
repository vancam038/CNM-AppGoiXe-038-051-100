var md5 = require('crypto-js/md5');
var uid = require('rand-token').uid;
var db = require('../fn/mysql-db');

exports.add = userEntity => {
	// userEntity = {
    //     Username: 1,
    //     Password: 'raw pwd',
    //     Name: 'name',
    //     Phone: 01231412313
    //     Type: 0
    // }
    var id = uid(10);
    var md5_pwd = md5(userEntity.Password);
    var sql = `insert into users(f_id, f_password, f_username, f_name , f_phone, f_type) values('${id}','${md5_pwd}', '${userEntity.Username}', '${userEntity.Name}', '${userEntity.Phone}',  ${userEntity.Type})`;

    return db.save(sql);
}

exports.login = loginEntity => {
    var md5_pwd = md5(loginEntity.pwd);
    console.log(md5_pwd);
	var sql = `select * from users where f_username = '${loginEntity.username}' and f_password = '${md5_pwd}' and f_type = '${loginEntity.type}'`;
	return db.load(sql);
}







