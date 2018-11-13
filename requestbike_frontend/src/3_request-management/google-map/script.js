// declare constants
const INIT_ZOOM_LEVEL = 6,
  DEFAULT_ZOOM_LEVEL = 20;
// DECLARE VARIABLES AND FUNCTIONS ============================================
let map = null,
  userMarker = null,
  infoWindow = null,
  prevLatLng = null; // ! get this by selected row

function drawUserMarker(latLng) {
  // remove map attached and listeners
  if (userMarker) {
    userMarker.setMap(null);
    google.maps.event.clearListeners(userMarker, "mouseup");
  }
  // draw new marker
  userMarker = new google.maps.Marker({
    position: latLng,
    map,
    draggable: true,
    animation: google.maps.Animation.DROP
  });
  // (re-)add event listeners
  userMarker.addListener("mouseup", moveUserMarkerMouseUp);
}

function moveUserMarkerMouseUp() {
  // geo query new position
  const newLagLng = {
    lat: userMarker.getPosition().lat(),
    lng: userMarker.getPosition().lng()
  };
  $.get(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${
      newLagLng.lat
    },${
      newLagLng.lng
    }&location_type=ROOFTOP&result_type=street_address&key=AIzaSyDas6_Z8AZ6sdYJGOucYDWh-MCcoB9jjVE`,
    function(data) {
      // extract data
      const { results, status } = data;
      if (status !== "OK") return;
      // confirm the new position
      const content = `
        <div class="infowindow-container">
          <p id="infowindow-address">${results[0].formatted_address}</p>
          <p>Điều chỉnh vị trí hành khách đến vị trí này?</p>
          <div class="infowindow-btn btn-group">
            <button class="btn btn-success" 
              onClick="document.getElementById('acceptChangeUserPosition').click()">
              Có
            </button>
            <button class="btn btn-cancel" 
              onClick="document.getElementById('declineChangeUserPosition').click()">
              Điều chỉnh tiếp
            </button>
            <button class="btn btn-primary" 
              onClick="document.getElementById('revertChangeUserPosition').click()">
              Về vị trí cũ
            </button>
          </div>
        </div>`;
      infoWindow = new google.maps.InfoWindow({ content });
      infoWindow.open(map, userMarker);
    }
  );
}

function handleQueryGeolocationFinish(pos) {
  // extract position
  const { latitude, longitude } = pos.coords;
  const userLatLng = new google.maps.LatLng(latitude, longitude);
  // add marker indicating user position
  drawUserMarker(userLatLng);
  // re-config the map
  map.setZoom(DEFAULT_ZOOM_LEVEL);
  map.panTo(userLatLng);
}

// handle buttons clicked in info window
if (document.getElementById("acceptChangeUserPosition"))
  document.getElementById("acceptChangeUserPosition").addEventListener(
    "click",
    function(e) {
      infoWindow.close();
      // send message to server
      socket.emit("");
    },
    false
  );

if (document.getElementById("declineChangeUserPosition"))
  document.getElementById("declineChangeUserPosition").addEventListener(
    "click",
    function(e) {
      infoWindow.close();
    },
    false
  );

if (document.getElementById("revertChangeUserPosition"))
  document.getElementById("revertChangeUserPosition").addEventListener(
    "click",
    function(e) {
      infoWindow.close();
      // move the marker back
      drawUserMarker(prevLatLng);
    },
    false
  );

// MAP INITIALIZING ===========================================================
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
}
