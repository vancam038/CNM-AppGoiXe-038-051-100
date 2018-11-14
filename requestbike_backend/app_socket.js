var express = require("express"),
  app = express(),
  server = require("http").Server(app),
  io = require("socket.io").listen(server);

// Repo START
var requestRepo = require("./src/repos/requestRepo");
// Repo END

// socket START

io.on("connection", socket => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  // cam_sv start
  socket.on("1_to_2_transfer-req", () => {
    socket.broadcast.emit("new_request_added");
  });
  // cam_sv end

  // duy-th start
  /* STAFF UPDATE PASSENGER POSITION
   * 1. client emit ("updated_passenger_position") along with new latlng and req identity
   * 2. server update corresponding req
   * 3. server emit ok
   * 4. client emit ask for new data ("1_to_2_transfer-req")
   * 5. server emit ("1_to_2_transfer-req") to response new data
   * 6. client update new data in table
   */
  socket.on("updated_passenger_position", newLatLng => {
    console.log(newLatLng);
  });
  // duy-th end
});

const PORT1 = process.env.PORT || 3001;

server.listen(PORT1, () => {
  console.log(`RequestBike Server Socket listening on: ${PORT1}`);
});

// socket END
