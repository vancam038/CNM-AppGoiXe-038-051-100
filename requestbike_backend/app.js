var express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    cors = require('cors');

var productCtrl = require('./src/apiControllers/productControllers');
var userCtrl = require('./src/apiControllers/userControllers');
var orderCtrl = require('./src/apiControllers/orderControllers');
var requestReceiverCtrl = require('./src/apiControllers/1_request-receiver/requestRecevierControllers');

var verifyAccessToken = require('./src/repos/authRepo').verifyAccessToken;

var app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());


app.get('/', (req, res) => {
    res.json({
        msg: 'hello from nodejs express api'
    })
});

app.use('/api/requestReceiver/', requestReceiverCtrl);
app.use('/api/products/', productCtrl);
app.use('/api/users/', userCtrl);
app.use('/api/orders/', verifyAccessToken, orderCtrl);


var port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`RequestBike API is running on port ${port}`);
})