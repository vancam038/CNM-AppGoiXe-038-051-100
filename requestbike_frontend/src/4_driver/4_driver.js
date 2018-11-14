var socket = io("http://localhost:3001");

// declare constants
const INIT_ZOOM_LEVEL = 6,
  DEFAULT_ZOOM_LEVEL = 20;
// DECLARE VARIABLES AND FUNCTIONS =======================================
// @circle indicates the area <= 100 meters around user's current position
let map = null,
  driverMarker = null,
  passengerMarker = null,
  passengerLatLng = null,
  circle = null,
  pathLine = null,
  prevLatLng = null;

$(function() {});

$(function() {
  $("#requestModalCenter").modal({
    backdrop: "static",
    // mặc định khi init, sẽ show modal. Nếu ko mún show thì chỉnh thành true
    show: false
  });
});

/// google map start ==========================================================

function getNewDriverMarkerLatLng() {
  return {
    lat: driverMarker.getPosition().lat(),
    lng: driverMarker.getPosition().lng()
  };
}

function getPrevDriverMarkerLatLng() {
  return { lat: prevLatLng.lat(), lng: prevLatLng.lng() };
}

function drawDriverMarker(latLng) {
  // remove map attached and listeners
  if (driverMarker) {
    driverMarker.setMap(null);
    google.maps.event.clearListeners(driverMarker, "mouseup");
    google.maps.event.clearListeners(driverMarker, "mousedown");
  }
  // draw new marker
  driverMarker = new google.maps.Marker({
    position: latLng,
    map,
    icon: "../../assets/img/driver.png",
    draggable: true,
    animation: google.maps.Animation.DROP
  });
  // (re-)add event listeners
  driverMarker.addListener("mouseup", moveDriverMarkerMouseUp);
  driverMarker.addListener("mousedown", moveDriverMarkerMouseUpMouseDown);
}

function drawDriverCircle(opts) {
  // remove map attached and listeners
  if (circle) {
    circle.setMap(null);
  }
  // draw new circle
  circle = new google.maps.Circle({
    strokeColor: opts.strokeColor,
    stokeOpacity: opts.stokeOpacity,
    strokeWeight: opts.strokeWeight,
    fillColor: opts.fillColor,
    fillOpacity: opts.fillOpacity,
    map,
    center: opts.center,
    radius: 100
  });
}

function drawPathDriverToPassenger(driverLatLng, passengerLatLng) {
  if (pathLine) {
    pathLine.setMap(null);
  }

  pathLine = new google.maps.Polyline({
    path: [driverLatLng, passengerLatLng],
    geodesic: true,
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 2
  });

  pathLine.setMap(map);
}

function showDialog(content = "Something happened") {
  const dialog = document.getElementById("dialog");
  if (dialog) {
    dialog.innerHTML = content;
    dialog.style.display = "block";
    window.setTimeout(() => {
      dialog.style.display = "none";
    }, 2000);
  }
}

let timer = null;
// change circle colors to notify if user had move marker too far
function moveDriverMarkerMouseUpMouseDown() {
  let isOutCircle = false;

  timer = setInterval(function() {
    const _newLagLng = getNewDriverMarkerLatLng(),
      _prevLatLng = getPrevDriverMarkerLatLng();
    if (Haversine(_prevLatLng, _newLagLng) > 100) {
      if (isOutCircle === false) {
        isOutCircle = true;
        drawDriverCircle({
          strokeColor: "#fc3232",
          stokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#ff7575",
          fillOpacity: 0.2,
          center: prevLatLng
        });
      }
    } else {
      if (isOutCircle === true) {
        isOutCircle = false;
        drawDriverCircle({
          strokeColor: "#4286f4",
          stokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#93bcff",
          fillOpacity: 0.2,
          center: prevLatLng
        });
      }
    }
  }, 100);
}

// if the distance between new moved and previous marker is
// <= 100, move marker to the new position
// otherwise, alert user and revert the marker to previous position
function moveDriverMarkerMouseUp() {
  clearInterval(timer);

  const _newLagLng = getNewDriverMarkerLatLng(),
    _prevLatLng = getPrevDriverMarkerLatLng();

  if (Haversine(_prevLatLng, _newLagLng) > 100) {
    // show alert
    showDialog("Vị trị mới không cách vị trí gốc quá 100m");
    // revert marker position
    drawDriverMarker(prevLatLng);
    // revert map center
    map.panTo(prevLatLng);
    // draw new circle
    drawDriverCircle({
      strokeColor: "#4286f4",
      stokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#93bcff",
      fillOpacity: 0.2,
      center: _prevLatLng
    });
    // draw new path
  } else {
    const { lat, lng } = getNewDriverMarkerLatLng();
    drawPathDriverToPassenger(
      new google.maps.LatLng(lat, lng),
      passengerLatLng
    );
    // prevLatLng = new google.maps.LatLng(_newLagLng.lat, _newLagLng.lng);
    // draw new circle
    // drawDriverCircle({
    //   strokeColor: "#4286f4",
    //   stokeOpacity: 0.8,
    //   strokeWeight: 2,
    //   fillColor: "#93bcff",
    //   fillOpacity: 0.2,
    //   center: prevLatLng
    // });
  }
}

function handleQueryGeolocationFinish(pos) {
  // extract position
  const { latitude, longitude } = pos.coords;
  const userLatLng = new google.maps.LatLng(latitude, longitude);
  // add marker indicating user position
  drawDriverMarker(userLatLng);
  // save the initial position for later use
  prevLatLng = new google.maps.LatLng(latitude, longitude);
  // draw circle
  drawDriverCircle({
    strokeColor: "#4286f4",
    stokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#93bcff",
    fillOpacity: 0.2,
    center: userLatLng
  });
  // re-config the map
  map.setZoom(DEFAULT_ZOOM_LEVEL);
  map.panTo(userLatLng);
  // set the map to use TrafficLayer
  // ? should turn this layer on before the journey started
  // const trafficLayer = new google.maps.TrafficLayer();
  // trafficLayer.setMap(map);
}

function initMap() {
  // find target to hold the map
  const targetDivMap = document.getElementById("map");
  if (!targetDivMap) {
    return;
  }
  // initialize the map
  map = new google.maps.Map(targetDivMap, {
    zoom: INIT_ZOOM_LEVEL,
    center: new google.maps.LatLng(21.028511, 105.804817) // HaNoi
  });
  // query user geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(handleQueryGeolocationFinish);
  }
}

function drawPassengerMarker(latLng) {
  passengerMarker = new google.maps.Marker({
    position: latLng,
    map,
    icon: "../../assets/img/man.png",
    draggable: false,
    animation: google.maps.Animation.DROP
  });
}

// google map end =============================================================

function changeStatus(status) {
  switch (status) {
    case "READY":
      $("#navbarDropdown").html("READY");
      $("#navbarDropdown")
        .removeClass("btn-outline-danger btn-outline-warning")
        .addClass("btn-outline-success");
      break;
    case "STANDBY":
      $("#navbarDropdown").html("STANDBY");
      $("#navbarDropdown")
        .removeClass("btn-outline-success btn-outline-danger")
        .addClass("btn-outline-warning");
      //socket start
      //socket end
      break;
    //etc...
    case "BUSY":
      $("#navbarDropdown").html("BUSY");
      $("#navbarDropdown")
        .removeClass("btn-outline-success btn-outline-warning")
        .addClass("btn-outline-danger");
      //socket start
      //socket end
      break;
  }
}

//socket start

//listen start
$(function() {
  // gửi trạng thái lên cho server
  // socket.emit("4_to_2_???", requestObject);

  // lắng nghe yêu cầu từ phía #2
  var timer = new Timer();
  socket.on("2_to_4_send-req-to-driver", msg => {
    const { reqId, lat, lng } = JSON.parse(msg);
    if (reqId === undefined || lat === undefined || lng === undefined) return;
    passengerLatLng = new google.maps.LatLng(lat, lng);
    drawPassengerMarker(passengerLatLng);
    drawPathDriverToPassenger(prevLatLng, passengerLatLng);
    // start đồng hồ

    if (timer.isRunning() == false) {
      timer.start({
        countdown: true,
        startValues: {
          seconds: 10
        }
      });
      $("#countdownExample #timer-value").html(timer.getTimeValues().seconds);
      timer.addEventListener("secondsUpdated", function(e) {
        $("#countdownExample #timer-value").html(timer.getTimeValues().seconds);
      });
      timer.addEventListener("targetAchieved", function(e) {
        $("#countdownExample #timer-value")
          .html("Không phản hồi")
          .addClass("timer-timeout");
        setTimeout(function() {
          $("#requestModalCenter").modal("hide");
        }, 1500);
      });

      // hiện modal accept
      $("#requestModalCenter").modal("show");
    }
  });
});
//socket end
