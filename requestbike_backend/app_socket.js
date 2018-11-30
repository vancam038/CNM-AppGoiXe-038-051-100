var express = require("express"),
  app = express(),
  server = require("http").Server(app),
  io = require("socket.io").listen(server);
var config = require("./src/config/config");
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
  socket.on("updated_passenger_position", newLatLng => {
    console.log(newLatLng);
  });
  // duy-th end

  socket.on("2_to_3_reload-table", () => {
    io.sockets.emit("2_to_3_reload-table");
  });

  socket.on("2_to_2_reload-table", data => {
    // trả về realtime record
    io.sockets.emit("2_to_2_reload-table", data);
  });

  socket.on("4_to_3_reload-table", () => {
    // trả về realtime record
    io.sockets.emit("4_to_3_reload-table");
  });

  socket.on("4_to_2_reload-table", () => {
    // trả về realtime record
    io.sockets.emit("4_to_2_reload-table");
  });
  // cam-sv end

  // duy-th start
  socket.on("2_to_4_send-req-to-driver", msg => {
    const { reqInfo, driverId } = JSON.parse(msg);
    io.sockets.emit(
      "req_send_to_driver",
      JSON.stringify({ ...reqInfo, driverId })
    );
  });
  // duy-th end
  // socket END
  //cuong_start
  socket.on("driver_accepted", reqId => {
    io.sockets.emit("driver_accepted", reqId);
  });
  //cuong_end
});

const PORT1 = process.env.PORT || 3001;

server.listen(PORT1, () => {
  console.log(`RequestBike Server Socket listening on: ${PORT1}`);
});
