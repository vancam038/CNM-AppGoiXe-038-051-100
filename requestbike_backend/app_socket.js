var express = require("express"),
  app = express(),
  server = require("http").Server(app),
  io = require("socket.io").listen(server);

// Repo START
var requestRepo = require("./src/repos/requestRepo");
// Repo END

// fn START
const Haversine = require("./src/fn/Haversine");
// fn END

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

  // cam-sv start
  // socket.on("2_to_4_send-req-to-driver", msg => {
  //   io.sockets.emit("2_to_4_send-req-to-driver", msg);
  // });

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
  // thay thế luồn "2_to_4_send-req-to-driver" ở trên
  socket.on("2_to_4_send-req-to-driver", msg => {
    const { reqInfo, drivers } = JSON.parse(msg);
    if (drivers.length < 1) return;
    const reqLatLng = { lat: reqInfo.lat, lng: reqInfo.lng };
    const distances = drivers.map(driver => {
      const driverLatLng = { lat: driver.lat, lng: driver.lng };
      if (
        driverLatLng.lat === null ||
        driverLatLng.lat === undefined ||
        driverLatLng.lng === null ||
        driverLatLng.lng === undefined
      )
        return Number.MAX_SAFE_INTEGER;
      return Haversine(reqLatLng, driverLatLng);
    });

    const { driverId } = drivers[distances.indexOf(Math.min(...distances))];
    io.sockets.emit(
      "2_to_4_send-req-to-driver",
      JSON.stringify({ ...reqInfo, driverId })
    );
  });
  // duy-th end

  // socket END
});

const PORT1 = process.env.PORT || 3001;

server.listen(PORT1, () => {
  console.log(`RequestBike Server Socket listening on: ${PORT1}`);
});
