var express = require("express"),
  app = express(),
  server = require("http").Server(app),
  io = require("socket.io").listen(server);
const request = require("request-promise");
const shortid = require("shortid");

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
  const reqs = [];
  socket.on("1_to_2_transfer-req", req => {
    // const reqIndex = reqs_1_to_2.length + 1;
    const { address } = req;
    const trimmedAddress = encodeURI(address.replace(" ", "+").trim());
    const opt = {
      uri: `https://maps.googleapis.com/maps/api/geocode/json?address=${trimmedAddress}&key=AIzaSyDas6_Z8AZ6sdYJGOucYDWh-MCcoB9jjVE`,
      headers: {
        "User-Agent": "Request-Promise"
      },
      json: true
    };

    request(opt)
      .then(res => {
        const { lat, lng } = res.results[0].geometry.location,
          { status } = res;
        if (status !== "OK") {
          console.log("STATUS: ", status);
          return new Error("Không xác định được coords");
        }
        // const _req = { ...req, id: socket.id, lat, lng };
        req.id = shortid.generate();
        req.lat = lat;
        req.lng = lng;
        requestRepo
          .add(req)
          .then(() => {
            requestRepo
              .loadAll()
              .then(rows => {
                reqs.push(req);
                io.sockets.emit("1_to_2_transfer-req", reqs);
                io.sockets.emit("1_to_3_transfer-req", rows);
              })
              .catch(err => {
                console.log(err);
                io.sockets.emit("1_to_2_transfer-req", err);
                io.sockets.emit("1_to_3_transfer-req", err);
              });
          })
          .catch(err => {
            console.log(err);
            io.sockets.emit("1_to_2_transfer-req", err);
          });
      })
      .catch(err => {
        console.log(err);
        io.sockets.emit("1_to_2_transfer-req", err);
      });

    // reqs_1_to_2.unshift(req);
    //To Do, gửi tạm cho tất cả socket -> sẽ fix gửi 1 sau -> đã fix
    // io.sockets.emit("1_to_2_transfer-req", reqs_1_to_2);

    // requestRepo
    //   .loadAll()
    //   .then(rows => {
    //     // nếu thành công thì trả về cho client #3
    //     io.sockets.emit("1_to_3_transfer-req", rows);
    //   })
    //   .catch(err => {
    //     console.log(err);
    //     io.sockets.emit("1_to_3_transfer-req", err);
    //   });
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
