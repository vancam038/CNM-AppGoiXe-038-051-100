var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io').listen(server);

var bodyParser = require('body-parser'),
    morgan = require('morgan'),
    cors = require('cors');

var requestReceiverCtrl = require('./src/apiControllers/requestRecevierControllers');
var locationIndentifierCtrl = require('./src/apiControllers/locationIdentifierControllers');

var verifyAccessToken = require('./src/repos/authRepo').verifyAccessToken;


app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());


app.get('/', (req, res) => {
    res.json({
        msg: 'hello from nodejs express api'
    })
});

io.on('connection', socket => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('request', data => {
        console.log(data);
        // io.sockets.emit('chat', msg);
    });
});

app.use('/api/requestReceiver/', requestReceiverCtrl);
app.use('/api/locationIndentifier/', locationIndentifierCtrl);


var port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`RequestBike Express is running on port ${port}`);
})

const PORT1 = process.env.PORT || 3001;

server.listen(PORT1, () => {
    console.log(`RequestBike Server Socket listening on: ${PORT1}`);
});