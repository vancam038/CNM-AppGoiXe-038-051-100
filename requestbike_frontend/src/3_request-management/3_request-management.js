var socket = io("http://localhost:3001");
var thisTr;

// perfect scrollbar start
$(function () {
  var ps = new PerfectScrollbar('.table-container', {
    wheelSpeed: 1,
    wheelPropagation: false,
    minScrollbarLength: 20
  });
});
// perfect scrollbar end

//For authorization
$(function () {

  let showModal = () => {
    $('#modalUnauthorized').modal('show');
    $('.modal-backdrop').show();
  };
  let getRequestList = function () {
    $.ajax({
      url: "http://localhost:3000/requests",
      type: "GET",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem('token_3')
      },
      dataType: "json",
      timeout: 10000
    }).done(function (data) {
      var source = document.getElementById("request-template").innerHTML;
      var template = Handlebars.compile(source);
      var html = template(data);
      $("#requests").html(html);
    });
  };
  $.ajax({
    url: "http://localhost:3000/user/me",
    type: "POST",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "x-access-token": localStorage.getItem('token_3')
    },
    dataType: 'json',
    success: function (data, status, jqXHR) {
      console.log(data);
      $('#driverName').text(data.info.name);
      getRequestList();
    },
    error: function (e) {
      //Handle auto login
      $.ajax({
        url: 'http://localhost:3000/auth/token',
        type: 'POST',
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
          "x-ref-token": localStorage.getItem('refToken_3')
        },
        dataType: 'json',
        success: function (data) {
          console.log('GET new token success');
          //Update access-token
          localStorage.setItem('token_3', data.access_token);
          //Get requests
          getRequestList();
        },
        error: function (jqXHR, txtStatus, err) {
          console.log('Get new token failed');
          console.log(err);
          showModal();
        }
      });

    }
  })

});

//For sockets
$(function () {
  socket.on("new_request_added", () => {
    $.ajax({
      url: "http://localhost:3000/requests",
      type: "GET",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem('token_3')
      },
      dataType: "json",
      timeout: 10000
    }).done(function (data) {
      var source = document.getElementById("request-template").innerHTML;
      var template = Handlebars.compile(source);
      var html = template(data);
      $("#requests").html(html);
      keepSelectedRow();
    });
  });
});

$(function () {
  //=================================================================
  //click on table body
  $('#reqTable tbody').on('click', 'tr', function () {
    // Thêm highlight cho dòng hiện tại
    $('#reqTable tbody tr').removeClass('selected');
    thisTr = $(this);
    thisTr.addClass('selected');

    var tableData = $(this).children("td").map(function () {
      return $(this).text();
    }).get();
    $('#reqId').val(tableData[0]);
    $('#addr').val(tableData[3]);
    $('#note').val(tableData[4])
    $('#status').val(tableData[5]);
    const lat = $(this).attr("data-lat");
    const lng = $(this).attr("data-lng");
    $('#lat').val(lat);
    $('#lng').val(lng);

    // xét status: 
    // nếu đã có xe nhận
    if (tableData[5] === REQ_STATUS_ACCEPTED) {
      $('#btn-path').prop('hidden', false);
      $('#btn-path').prop('disabled', false);

      // TODO: Hiển thị đường đi ngắn nhất từ driver tới req


    } else { // nếu ko phải là có xe nhận -> các trường hợp còn lại
      $('#btn-path').prop('hidden', true);
      // hiển thị lun địa chỉ gốc của req lên map????
      // prevLatLng = new google.maps.LatLng(lat, lng);
      // showIdentifiedReq(prevLatLng);
    }
  });

  $('#btn-path').click(function (e) {
    e.preventDefault();
    // TODO: Hiển thị đường đi từ driver đến khách + show thông tin driver
    const reqLat = $('#lat').val();
    const reqLng = $('#lng').val();
    const reqId = $('#reqId').val();

    // lấy tọa độ của driver lên
    $.ajax({
      url: "http://localhost:3000/driver/" + reqId,
      type: "GET",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem('token_3')
      },
      dataType: "json"
    }).done(function (data) {
      console.log(data);

      if (data.length > 0) {
        driverInfo = JSON.parse(JSON.stringify(data));
        console.log(driverInfo);
        const driverLat = driverInfo[0].lat;
        const driverLng = driverInfo[0].lng;
        passengerLatLng = new google.maps.LatLng(reqLat, reqLng);
        driverLatLng = new google.maps.LatLng(driverLat, driverLng);
        clearMap();
        drawDriverMarker(driverLatLng);
        drawPassengerMarker(passengerLatLng);
        drawPathDriverToPassenger(driverLatLng, passengerLatLng);
        // map.setZoom(DEFAULT_ZOOM_LEVEL);    
      }
    });
  });
});

$(function () {
  socket.on("2_to_3_reload-table", () => {
    $.ajax({
      url: "http://localhost:3000/requests",
      type: "GET",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem('token_3')
      },
      dataType: "json"
    }).done(function (data) {
      var source = document.getElementById("request-template").innerHTML;
      var template = Handlebars.compile(source);
      var html = template(data);
      $("#requests").html(html);
      keepSelectedRow();
    });
  });

  socket.on("4_to_3_reload-table", () => {
    $.ajax({
      url: "http://localhost:3000/requests",
      type: "GET",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem('token_3')
      },
      dataType: "json"
    }).done(function (data) {
      var source = document.getElementById("request-template").innerHTML;
      var template = Handlebars.compile(source);
      var html = template(data);
      $("#requests").html(html);
      keepSelectedRow();
    });
  })
})

function keepSelectedRow() {
  $('#reqTable tr').each(function () {
    if ($(this).children('td:first').html() === $('#reqId').val()) {
      $('#reqTable tr').removeClass('selected');
      $(this).addClass('selected');
    }
  })
}