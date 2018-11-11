var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io').listen(server);

var bodyParser = require('body-parser'),
    morgan = require('morgan'),
    cors = require('cors');


// server nodejs START

var requestCtrl = require('./src/apiControllers/requestControllers');

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

    socket.on('1_to_2_transfer-req', data => {
        console.log(data);
        // khong co Repo de goi loadAll -> Mang qua router, ma router nao? -> requestctrl
        // io.sockets.emit('chat', msg);
    });
});

const PORT1 = process.env.PORT || 3001;

server.listen(PORT1, () => {
    console.log(`RequestBike Server Socket listening on: ${PORT1}`);
});

// socket END