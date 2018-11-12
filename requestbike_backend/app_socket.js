var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io').listen(server);

// Repo START
var requestRepo = require('./src/repos/requestRepo');
// Repo END

// socket START

io.on('connection', socket => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    // cam_sv start
    let reqs_1_to_2 = [];
    socket.on('1_to_2_transfer-req', req => {
        console.log(req);
        req.id = reqs_1_to_2.length + 1;
        reqs_1_to_2.unshift(req);
        //To Do, gửi tạm cho tất cả socket -> sẽ fix gửi 1 sau
        io.sockets.emit('1_to_2_transfer-req', reqs_1_to_2);
    });

    socket.on('1_to_3_transfer-req', msg => {
        console.log(msg);
        requestRepo.loadAll()
            .then(rows => {
                // nếu thành công thì trả về cho client #3
                io.sockets.emit('1_to_3_transfer-req', rows);
            }).catch(err => {
                console.log(err);
                // nếu thành công thì trả về cho client #3
                io.sockets.emit('1_to_3_transfer-req', err);
            });
    });
    // cam_sv end
});

const PORT1 = process.env.PORT || 3001;

server.listen(PORT1, () => {
    console.log(`RequestBike Server Socket listening on: ${PORT1}`);
});

// socket END