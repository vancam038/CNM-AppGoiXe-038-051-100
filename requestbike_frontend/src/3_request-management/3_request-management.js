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
    url: "http://localhost:3000/requests",
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
      url: "http://localhost:3000/requests",
      type: "GET",
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
    $(this).addClass('selected');

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
    // TODO:
  });
});

$(function () {
  socket.on("2_to_3_reload-table", () => {
    $.ajax({
      url: "http://localhost:3000/requests",
      type: "GET",
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