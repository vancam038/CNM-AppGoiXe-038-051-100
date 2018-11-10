var http = require('http'),
    express = require('express'),
    socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var requestReceiverRepo = require('../../repos/requestReceiverRepo');
var router = express.Router();

//
// load orders by User

router.get('/request', (req,res) => {
    json = {name: "hế nhô"};
    res.status(200).json(json);
});

router.post('/request', (req, res) => {
    console.log(req.body);
    // io.on('connection', socket => {
    //     console.log('a user connected');

    //     socket.on('disconnect', () => {
    //         console.log('user disconnected');
    //     });

    //     socket.on('request', msg => {
    //         console.log(`message: ${msg}`);
    //         // io.sockets.emit('chat', msg);
    //     });
    // });
    requestReceiverRepo.add(req.body)
        .then(value => {
            console.log(value);
            res.statusCode = 201;
            res.json(req.body);
        })
        .catch(err => {
            console.log(err);
            res.statusCode = 500;
            res.end('View error log on console');
        })
})

module.exports = router;