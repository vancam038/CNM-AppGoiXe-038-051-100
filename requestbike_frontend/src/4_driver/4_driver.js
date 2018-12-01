var socket = io("http://localhost:3001");
let infoWindow = null;
let reqId_global;

$(function() {
  $("#requestModalCenter").modal({
    backdrop: "static",
    // mặc định khi init, sẽ show modal. Nếu ko mún show thì chỉnh thành false
    show: false
  });
  //First requests
  let showModal = () => {
    $("#modalUnauthorized").modal("show");
    $(".modal-backdrop").show();
  };
  $.ajax({
    url: "http://localhost:3000/user/me",
    type: "POST",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "x-access-token": localStorage.getItem("token_4")
    },
    dataType: "json",
    success: function(data, status, jqXHR) {
      console.log(data);
      $("#driverName").text(data.info.name);
      changeStatus(DRIVER_STATUS_STANDBY);
    },
    error: function(e) {
      //Handle auto login
      $.ajax({
        url: "http://localhost:3000/auth/token",
        type: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
          "x-ref-token": localStorage.getItem("refToken_4")
        },
        dataType: "json",
        success: function(data) {
          console.log("GET new token success");
          //Update access-token
          localStorage.setItem("token_4", data.access_token);
          changeStatus(DRIVER_STATUS_STANDBY);
        },
        error: function(jqXHR, txtStatus, err) {
          console.log("Get new token failed");
          console.log(err);
          showModal();
        }
      });
    }
  });
});

// ------------------------------------ driver ajax start
function updateDriverStatus(status, driverId) {
  const driverObject = {
    driverId,
    status
  };
  $.ajax({
    url: "http://localhost:3000/driver/status",
    type: "PATCH",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "x-access-token": localStorage.getItem("token_4")
    },
    data: JSON.stringify(driverObject),
    dataType: "json"
  });
}

function updateDriverReqId(reqId, driverId) {
  const driverObject = {
    driverId,
    reqId
  };

  $.ajax({
    url: "http://localhost:3000/driver/reqId",
    type: "PATCH",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "x-access-token": localStorage.getItem("token_4")
    },
    data: JSON.stringify(driverObject),
    dataType: "json"
  });
}

function updateDriverCoords(newLat, newLng, driverId) {
  const driverObject = {
    driverId,
    newLat,
    newLng
  };
  console.log(driverId, newLat, newLng);
  $.ajax({
    url: "http://localhost:3000/driver/coords",
    type: "PATCH",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "x-access-token": localStorage.getItem("token_4")
    },
    data: JSON.stringify(driverObject),
    dataType: "json"
  });
}

var getDriverIdPromise = () => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "http://localhost:3000/user/id",
      type: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("token_4")
      },
      dataType: "json"
    }).done(function(driverObject) {
      resolve(driverObject.id);
    });
  });
};

// ------------------------------------ driver ajax end

// --------------------------------------------req ajax start
function changeStatus(status) {
  switch (status) {
    case DRIVER_STATUS_READY:
      $("#navbarDropdown").html(DRIVER_STATUS_READY);
      $("#navbarDropdown")
        .removeClass("btn-outline-danger btn-outline-warning")
        .addClass("btn-outline-success");
      // ajax cập nhật status của tài xế thành ready và latlng của tài xế
      getDriverIdPromise().then(currentDriverId => {
        updateDriverStatus(DRIVER_STATUS_READY, currentDriverId);
        const { lat, lng } = getNewDriverMarkerLatLng();
        updateDriverCoords(lat, lng, currentDriverId);
      });
      break;
    case DRIVER_STATUS_STANDBY:
      $("#navbarDropdown").html(DRIVER_STATUS_STANDBY);
      $("#navbarDropdown")
        .removeClass("btn-outline-success btn-outline-danger")
        .addClass("btn-outline-warning");
      //socket start
      //socket end
      // ajax cập nhật status của tài xế thành standby
      getDriverIdPromise().then(currentDriverId => {
        updateDriverStatus(DRIVER_STATUS_STANDBY, currentDriverId);
      });
      break;
    case DRIVER_STATUS_BUSY:
      $("#navbarDropdown").html(DRIVER_STATUS_BUSY);
      $("#navbarDropdown").prop("disabled", true);
      $("#navbarDropdown")
        .removeClass("btn-outline-success btn-outline-warning")
        .addClass("btn-outline-danger");
      // ajax cập nhật status của tài xế thành busy
      getDriverIdPromise().then(currentDriverId => {
        updateDriverStatus(DRIVER_STATUS_BUSY, currentDriverId);
      });
      break;
  }
}

function updateReqStatus(reqId, reqStatus) {
  const status = reqStatus;
  const reqObject = {
    reqId,
    status
  };

  // Đầu tiên, cập nhật status của nó dưới db
  $.ajax({
    url: "http://localhost:3000/request/status",
    type: "PATCH",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "x-access-token": localStorage.getItem("token_4")
    },
    data: JSON.stringify(reqObject),
    dataType: "json"
  }).done(function() {
    // emit cho 3 là request này đã có xe nhận || đang di chuyển || kết thúc-> reload lại table
    socket.emit("4_to_3_reload-table");
    // emit cho 2 là đã có xe nhận -> reload lại table -> mất req identified bên #2
    socket.emit("4_to_2_reload-table");
  });
}

function updateReqDriverId(reqId, driverId) {
  const reqObject = {
    reqId,
    driverId
  };

  $.ajax({
    url: "http://localhost:3000/request/driverId",
    type: "PATCH",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "x-access-token": localStorage.getItem("token_4")
    },
    data: JSON.stringify(reqObject),
    dataType: "json"
  }).done(function() {
    // emit cho 3 là request này đã có xe nhận || đang di chuyển || kết thúc-> reload lại table
    socket.emit("4_to_3_reload-table");
    // emit cho 2 là đã có xe nhận -> reload lại table -> mất req identified bên #2
    socket.emit("4_to_2_reload-table");
  });
}
// ------------------------------- req ajax end

// lat:  reqLat, lng: reqLng, addr: reqAddr
function updateMap(lat, lng, addr) {
  // đóng infoWindow trước đó
  if (infoWindow) infoWindow.close();
  // đóng passengerMarker trước đó
  if (passengerMarker) passengerMarker.setMap(null);

  // driverMarker sẽ ko thể drag nữa
  driverMarker.setDraggable(false);

  passengerLatLng = new google.maps.LatLng(lat, lng);
  drawPassengerMarker(passengerLatLng);
  drawPathDriverToPassenger(getNewDriverMarkerLatLng(), passengerLatLng);

  // show thông tin hành khách
  infoWindow = new google.maps.InfoWindow({
    content: `<span style="font-weight:bold">${addr}</span>`
  });
  infoWindow.open(map, passengerMarker);
}

//socket start

//listen start
$(function() {
  // lắng nghe yêu cầu từ phía #2
  var timer = new Timer();
  socket.on("req_send_to_driver", msg => {
    const { reqId, lat, lng, addr, driverId } = JSON.parse(msg);
    if (
      reqId === undefined ||
      lat === undefined ||
      lng === undefined ||
      driverId === undefined
    )
      return;

    // nếu id driver không có trong list driver id thì thôi
    // có thì hiện modal
    getDriverIdPromise().then(_driverId => {
      if (driverId !== _driverId) return;
      // save lại thành biến toàn cục để dành xài
      changeStatus(DRIVER_STATUS_BUSY);
      reqId_global = reqId;

      // start đồng hồ
      if (timer.isRunning() == false) {
        // Khởi tạo
        $("#countdownExample #timer-value").html('<div class="loader"></div>');
        $("#btn-accept").prop("disabled", false);
        $("#btn-reject").prop("disabled", false);

        timer.start({
          countdown: true,
          startValues: {
            seconds: 10
          }
        });
        var acceptPromise = () => {
          // Promise start
          return new Promise((resolve, reject) => {
            timer.addEventListener("secondsUpdated", function(e) {
              // Cập nhật số giây
              $("#countdownExample #timer-value").html(
                timer.getTimeValues().seconds
              );
              // khi click button chấp nhận
              $("#btn-accept").click(() => {
                // stop đồng hồ lại
                timer.stop();

                // Mở button Đón khách lên
                $("#btn-take").prop("disabled", false);

                // resolve cho promise bằng true
                resolve(true);
              });

              // Khi click button Từ Chối
              $("#btn-reject").click(() => {
                timer.stop();
                changeStatus(DRIVER_STATUS_READY);
                $("#navbarDropdown").prop("disabled", false);
                // timer.reset();
                resolve(false);
              });
            });
          });
          // Promise end
        };

        acceptPromise().then(accepted => {
          if (accepted) {
            // update lại map
            updateMap(lat, lng, addr);

            // update trạng thái của request dưới db
            updateReqStatus(reqId, REQ_STATUS_ACCEPTED);

            // Đổi trạng thái của driver thành BUSY
            changeStatus(DRIVER_STATUS_BUSY);

            //update ReqId cua driver phu trach
            getDriverIdPromise().then(currentDriverId => {
              updateDriverReqId(reqId, currentDriverId);
            });

            // Gọi ajax cập nhật tọa độ driver phụ trách request đó
            getDriverIdPromise().then(currentDriverId => {
              updateDriverCoords(
                driverMarker.getPosition().lat(),
                driverMarker.getPosition().lng(),
                currentDriverId
              );
            });

            //update driverId của request
            getDriverIdPromise().then(currentDriverId => {
              updateReqDriverId(reqId, currentDriverId);
            });
            socket.emit("driver_accepted", reqId);
          } else {
            //Xu ly driver tu choi request
            getDriverIdPromise().then(driverId => {
              socket.emit(
                "driver_declined",
                JSON.stringify({ reqId, driverId })
              );
            });
          }
        });

        timer.addEventListener("targetAchieved", function(e) {
          // tắt 2 nút chấp nhận và từ chối
          $("#btn-accept").prop("disabled", true);
          $("#btn-reject").prop("disabled", true);

          $("#countdownExample #timer-value")
            .html("Không phản hồi")
            .addClass("timer-timeout");
          setTimeout(function() {
            $("#requestModalCenter").modal("hide");
            $("#countdownExample #timer-value").removeClass("timer-timeout");
            $("#btn-accept").prop("disabled", false);
            $("#btn-reject").prop("disabled", false);
            changeStatus(DRIVER_STATUS_READY);
            $("#navbarDropdown").prop("disabled", false);
          }, 500);

          //Xu ly nhu driver tu choi request
          getDriverIdPromise().then(driverId => {
            socket.emit("driver_declined", JSON.stringify({ reqId, driverId }));
          });
        });

        // hiện modal accept
        $("#requestModalCenter").modal("show");
      }
    });
  });
});
//socket end

$(function() {
  // khi click button Đón Khách
  $("#btn-take").click(() => {
    // tự disable chính mình
    $("#btn-take").prop("disabled", true);
    // mở nút Bắt đầu lên
    $("#btn-start").prop("disabled", false);
    // chuyển trạng thái thành BUSY
    changeStatus(DRIVER_STATUS_BUSY);
    // disable lun trạng thái, ko cho sửa
    $("#navbarDropdown").prop("disabled", true);

    // xử lý marker driver nhảy vị trí tới marker khách
    passengerMarker.setMap(null);
    driverMarker.setMap(null);
    // lúc này số lượng marker giảm còn 1 marker -> đổi marker thành chiếc xe đèo khách -> moving.png
    driverMarker = new google.maps.Marker({
      position: passengerLatLng,
      map,
      icon: "../../assets/img/moving.png",
      draggable: false,
      animation: google.maps.Animation.BOUNCE
    });
  });

  // khi click button Bắt Đầu
  $("#btn-start").click(() => {
    // tự disable chính mình
    $("#btn-start").prop("disabled", true);

    // chọn địa điểm tới tùy ý
    // -> bằng cách kéo thả marker trên map rồi confirm yes/no bằng infoWindow -> giống App#2
    // driverMarker draggable
    driverMarker.setMap(null);
    driverMarker = new google.maps.Marker({
      position: passengerLatLng,
      map,
      icon: "../../assets/img/moving.png",
      draggable: true
    });
    driverMarker.addListener("mouseup", function() {
      if (infoWindow) infoWindow.close();
      const desLat = driverMarker.getPosition().lat(),
        desLng = driverMarker.getPosition().lng();
      $.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${desLat},${desLng}&location_type=ROOFTOP&result_type=street_address&key=AIzaSyDas6_Z8AZ6sdYJGOucYDWh-MCcoB9jjVE`,
        function(data) {
          infoWindow = new google.maps.InfoWindow({
            content: `
                <div class="infowindow-container">
                  <p style="font-weight: bold; color: red;" id="infowindow-address">${
                    data.status === "OK"
                      ? data.results[0].formatted_address
                      : ""
                  }</p>
                  <p style="font-weight: bold">Đây có phải là vị trí đã thương lượng với khách?</p>
                  <div class="infowindow-btn btn-group">
                    <button class="btn btn-success" 
                      onClick="document.getElementById('acceptDestination').click()">
                      Đồng ý
                    </button>
                    <button class="btn btn-basic btn-cancel" 
                      onClick="document.getElementById('declineDestination').click()">
                      Không, di chuyển tiếp
                    </button>
                  </div>
                </div>`
          });
          infoWindow.open(map, driverMarker);
        }
      );
    });

    // reset Driver map
    resetDriverMap();

    // cập nhật status của req thành MOVING
    updateReqStatus(reqId_global, REQ_STATUS_MOVING);
  });

  // khi click button Kết Thúc
  $("#btn-finish").click(() => {
    // tự disable chính mình
    $("#btn-finish").prop("disabled", true);

    // xử lý trạng thái của driver: chuyển lại thành READY
    // enable lại trạng thái
    $("#navbarDropdown").prop("disabled", false);
    // chuyển thành READY
    changeStatus(DRIVER_STATUS_READY);
    // reset map
    resetDriverMap(REQ_STATUS_FINISHED);

    // cập nhật status thành Finish
    updateReqStatus(reqId_global, REQ_STATUS_FINISHED);
  });
});

$(function() {
  $("#acceptDestination").click(function() {
    infoWindow.close();
    google.maps.event.clearListeners(driverMarker, "mouseup");
    google.maps.event.clearListeners(driverMarker, "mousedown");
    // driverMarker sẽ ko thể drag nữa
    driverMarker.setDraggable(false);

    // Nếu là yes -> đã tới địa điểm thương lượng -> thì mới mở nút Kết thúc lên để end chuyến đi
    // mở nút Kết Thúc lên
    $("#btn-finish").prop("disabled", false); // chỉ khi ấn nút Yes của infoWindow thì mới mở lên});
  });

  $("#declineDestination").click(function() {
    infoWindow.close();
  });
});
