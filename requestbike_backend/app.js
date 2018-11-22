require("./app_socket");
var express = require("express"),
  app = express();

var bodyParser = require("body-parser"),
  morgan = require("morgan"),
  cors = require("cors");


// server nodejs START

// Controllers START
var driverCtrl = require("./src/apiControllers/driverControllers");
var requestCtrl = require("./src/apiControllers/requestControllers");
var userCtrl = require("./src/apiControllers/userController");
// Controllers END

var verifyAccessToken = require("./src/repos/authRepo").verifyAccessToken;

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(cors());

app.use("/user", userCtrl);
// for test purpose
app.use("/", requestCtrl);

app.use("/driver", driverCtrl);

// JWT cho api
// app.use("/", verifyAccessToken, requestCtrl);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`RequestBike Express is running on port ${PORT}`);
});

// server nodejs END
