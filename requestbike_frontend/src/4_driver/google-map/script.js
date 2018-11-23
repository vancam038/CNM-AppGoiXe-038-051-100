// DECLARE VARIABLES AND FUNCTIONS =======================================
// @circle indicates the area <= 100 meters around user's current position
let map = null,
  driverMarker = null,
  passengerMarker = null,
  passengerLatLng = null,
  circle = null,
  pathLine = null,
  prevLatLng = null;

/// google map start ==========================================================

function getNewDriverMarkerLatLng() {
  return {
    lat: driverMarker.getPosition().lat(),
    lng: driverMarker.getPosition().lng()
  };
}

function getPrevDriverMarkerLatLng() {
  return {
    lat: prevLatLng.lat(),
    lng: prevLatLng.lng()
  };
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
    animation: google.maps.Animation.BOUNCE
  });
  // (re-)add event listeners
  driverMarker.addListener("mouseup", moveDriverMarkerMouseUp);
  driverMarker.addListener("mousedown", moveDriverMarkerMouseDown);
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
  var directionsService = new google.maps.DirectionsService();
  const DirectionsRequest = {
    origin: driverLatLng,
    destination: passengerLatLng,
    travelMode: "DRIVING"
  };
  directionsService.route(DirectionsRequest, function(result, status) {
    if (status == "OK") {
      //todo
      directionsDisplay = new google.maps.DirectionsRenderer({
        directions: result,
        map: map,
        markerOptions: {
          visible: false
        }
      });
    }
  });
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
function moveDriverMarkerMouseDown() {
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
      center: prevLatLng
    });
    // draw new path
  } else {
    // do nothing
  }
}

function handleQueryGeolocationFinish(pos) {
  // extract position
  const { latitude, longitude } = pos.coords;
  const initialDriverPos = new google.maps.LatLng(latitude, longitude);
  // add marker indicating user position
  drawDriverMarker(initialDriverPos);
  // save the initial position for later use
  // prevLatLng = new google.maps.LatLng(latitude, longitude);
  prevLatLng = initialDriverPos;
  // draw circle
  drawDriverCircle({
    strokeColor: "#4286f4",
    stokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#93bcff",
    fillOpacity: 0.2,
    center: initialDriverPos
  });
  // re-config the map
  map.setZoom(DEFAULT_ZOOM_LEVEL);
  map.panTo(initialDriverPos);
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
    center: new google.maps.LatLng(10.762622, 106.660172) // HCM
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
    animation: google.maps.Animation.BOUNCE,
    draggable: false
  });
}

// google map end =============================================================
