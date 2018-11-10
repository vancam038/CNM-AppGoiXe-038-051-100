var md5 = require('crypto-js/md5');

var db = require('../fn/mysql-db');

exports.add = userEntity => {
	// userEntity = {
    //     Username: 1,
    //     Password: 'raw pwd',
    //     Name: 'name',
    //     Email: 'email',
    //     DOB: '2000-09-01',
    //     Permission: 0
    // }

    var md5_pwd = md5(userEntity.Password);
    var sql = `insert into users(f_Username, f_Password, f_Name, f_Email, f_DOB, f_Permission) values('${userEntity.Username}', '${md5_pwd}', '${userEntity.Name}', '${userEntity.Email}', '${userEntity.DOB}', ${userEntity.Permission})`;

    return db.save(sql);
}

exports.login = loginEntity => {
	// loginEntity = {
	// 	user: 'nndkhoa',
	// 	pwd: 'nndkhoa'
	// }

    var md5_pwd = md5(loginEntity.pwd);
	var sql = `select * from users where f_Username = '${loginEntity.user}' and f_Password = '${md5_pwd}'`;
	return db.load(sql);
}







