var socket = io("http://localhost:3001");

// perfect scrollbar start
$(function () {
  var ps = new PerfectScrollbar('.table-container', {
    wheelSpeed: 1,
    wheelPropagation: false,
    minScrollbarLength: 20
  });
});
// perfect scrollbar end

$(function () {
  $.ajax({
    url: "http://localhost:3000/requests/unidentified",
    type: "GET",
    dataType: "json",
    timeout: 10000
  }).done(function (data) {
    var source = document.getElementById("request-template").innerHTML;
    var template = Handlebars.compile(source);
    var html = template(data);
    $("#requests").html(html);
  });

  socket.on("new_request_added", () => {
    $.ajax({
      url: "http://localhost:3000/requests/unidentified",
      type: "GET",
      dataType: "json",
      timeout: 10000
    }).done(function (data) {
      var source = document.getElementById("request-template").innerHTML;
      var template = Handlebars.compile(source);
      var html = template(data);
      $("#requests").html(html);
    });
  });
});

// function sendReqToDriver(btn) {
//   console.log(btn);
//   const tr = $(btn).closest("tr")[0];
//   const reqId = $(tr).attr("data-id"),
//     lat = $(tr).attr("data-lat"),
//     lng = $(tr).attr("data-lng");
//   if (reqId === undefined || lat === undefined || lng === undefined) return;
//   // cam-sv start
//   socket.emit("2_to_4_send-req-to-driver", JSON.stringify({ reqId, lat, lng }));
//   // cam-sv end
// }

$(function () {
  //=================================================================
  //click on table body
  //$("#tableMain tbody tr").click(function () {
  $('#reqTable tbody').on('click', 'tr', function () {
    //get row contents into an array
    var tableData = $(this).children("td").map(function () {
      return $(this).text();
    }).get();
    console.log(tableData);
    $('#reqId').val(tableData[0]);
    $('#addr').val(tableData[3]);
    $('#status').val(tableData[5]);
    const lat = $(this).attr("data-lat");
    const lng = $(this).attr("data-lng");
    $('#lat').val(lat);
    $('#lng').val(lng);
  });

  $(".btn-locate").click(function () {
    const reqId = $('#reqId').val();
    const lat = $('#lat').val();
    const lng = $('#lng').val();
    const status = $('#status').val();
    // console.log(getStatusByReqId('reqTable', 'reqId'));
    if (!validateString(reqId) || !validateString(lat) || !validateString(lng) || status !== 'UNIDENTIFIED') {
      alert('Hãy chọn một request để định vị');
      return;
    }
    prevLatLng = new google.maps.LatLng(lat, lng);
    handleQueryGeolocationFinish(prevLatLng);
  });

  $(".btn-find").click(function () {
    const reqId = $('#reqId').val();
    const lat = $('#lat').val();
    const lng = $('#lng').val();
    if (!validateString(reqId) || !validateString(lat) || !validateString(lng)) {
      alert('Hãy chọn một request để định vị');
      return;
    }
    // cam-sv start
    socket.emit(
      "2_to_4_send-req-to-driver",
      JSON.stringify({
        reqId,
        lat,
        lng
      })
    );
    // cam-sv end
  });

});

