var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io').listen(server);

var bodyParser = require('body-parser'),
    morgan = require('morgan'),
    cors = require('cors');

// Repo START
var requestRepo = require('./src/repos/requestRepo');
// Repo END

// server nodejs START

// Controllers START
var requestCtrl = require('./src/apiControllers/requestControllers');
// Controllers END

var verifyAccessToken = require('./src/repos/authRepo').verifyAccessToken;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());


app.get('/', (req, res) => {
    res.json({
        msg: 'hello from nodejs express api'
    })
});

app.use('/', requestCtrl);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`RequestBike Express is running on port ${PORT}`);
})

// server nodejs END

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