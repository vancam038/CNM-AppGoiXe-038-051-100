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
    socket.on('1_to_2_transfer-req', data => {
        console.log(data);
        requestRepo.loadAll()
            .then(rows => {
                // nếu thành công thì trả về cho client #2
                io.sockets.emit('1_to_2_transfer-req', rows);
            }).catch(err => {
                console.log(err);
                // nếu thành công thì trả về cho client #2
                io.sockets.emit('1_to_2_transfer-req', err);
            });
    });
    // cam_sv end
});

const PORT1 = process.env.PORT || 3001;

server.listen(PORT1, () => {
    console.log(`RequestBike Server Socket listening on: ${PORT1}`);
});

// socket END