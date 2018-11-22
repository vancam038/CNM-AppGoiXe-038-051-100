var jwt = require('jsonwebtoken');
var rndToken = require('rand-token');
var moment = require('moment');
var md5 = require('crypto-js/md5');
var uid = require('rand-token').uid;
var db = require('../fn/mysql-db');

const SECRET = 'ABCDEF';
const AC_LIFETIME = 600; // seconds
exports.LIFETIME = () => {
    return AC_LIFETIME;
};
exports.generateAccessToken = userEntity => {
    var payload = {
        user: userEntity
    };

    var token = jwt.sign(payload, SECRET, {
        expiresIn: AC_LIFETIME
    });

    return token;
};

exports.verifyAccessToken = (req, res, next) => {
    var token = req.headers['x-access-token'];
    console.log(token);

    if (token) {
        jwt.verify(token, SECRET, (err, payload) => {
            if (err) {
                res.statusCode = 401;
                if(err.name === 'TokenExpiredError'){
                    res.json({
                        msg: 'TOKEN_EXPIRED'
                    })
                }else{
                    res.json({
                        msg:'INVALID_TOKEN'
                    })
                }
            } else {
                console.log(payload);
                req.token_payload = payload;
                next();
            }
        });
    } else {
        res.statusCode = 403;
        res.json({
            msg: 'NO_TOKEN'
        })
    }
}

exports.generateRefreshToken = () => {
    const SIZE = 80;
    return rndToken.generate(SIZE);
}

exports.updateRefreshToken = (userId, rfToken) => {
    return new Promise((resolve, reject) => {

        var sql = `delete from userRefTokenExt where f_userId = '${userId}'`;
        db.save(sql) // delete
            .then(value => {
                var rdt = moment().format('YYYY-MM-DD HH:mm:ss');
                sql = `insert into userRefTokenExt values('${userId}', '${rfToken}', '${rdt}')`;
                return db.save(sql);
            })
            .then(value => resolve(value))
            .catch(err => reject(err));
    });
};
exports.verifyRefreshToken = (userId, rfToken) => {
  return new Promise((resolve, reject) =>{
     var sql = `select * from userRefTokenExt where f_refToken = '${rfToken}'`;
     db.load(sql)
         .then(rows => {
             if(rows.length > 0){
                 console.log(rows[0]);
             }else{
                 console.log('No refToken was found!');
             }
         });
  });
};

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