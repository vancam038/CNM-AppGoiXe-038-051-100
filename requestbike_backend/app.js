require('./app_socket');
var express = require('express'),
    app = express();
    
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

app.use('/', requestCtrl);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`RequestBike Express is running on port ${PORT}`);
})

// server nodejs END

