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
    url: "http://localhost:3000/requests/unidentified+identified",
    type: "GET",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
      // ,"x-access-token": localStorage.getItem('token')
    },
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
      url: "http://localhost:3000/requests/unidentified+identified",
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

    $('#btn-locate').prop('disabled', false);
    $('#btn-find').prop('disabled', false);

    // xét status: 
    if (tableData[5] === REQ_STATUS_UNIDENTIFIED) {
      $('#btn-locate').prop('hidden', false);
      $('#btn-find').prop('hidden', true);
    } else {
      $('#btn-locate').prop('hidden', true);
      $('#btn-find').prop('hidden', false);
      prevLatLng = new google.maps.LatLng(lat, lng);
      showIdentifiedReq(prevLatLng);
    }
  });

  $("#btn-locate").click(function (e) {
    e.preventDefault();
    const reqId = $('#reqId').val();
    const lat = $('#lat').val();
    const lng = $('#lng').val();
    const status = $('#status').val();
    if (!validateString(reqId) || !validateString(lat) || !validateString(lng)) {
      showErrorMsg('Hãy chọn một request');
      return;
    }
    prevLatLng = new google.maps.LatLng(lat, lng);
    handleQueryGeolocationFinish(prevLatLng);
  });

  $("#btn-find").click(function (e) {
    e.preventDefault();
    const reqId = $('#reqId').val();
    const lat = $('#lat').val();
    const lng = $('#lng').val();
    const addr = $('#addr').val();
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
        lng,
        addr
      })
    );
    // cam-sv end
  });

});

function keepSelectedRow() {
  $('#reqTable tr').each(function () {
    if ($(this).children('td:first').html() === $('#reqId').val()) {
      $('#reqTable tr').removeClass('selected');
      $(this).addClass('selected');
    }
  })
}

function setStatusByReqId(tableId, idReq, status) {
  const tableId_string = '#' + tableId;
  const reqId_string = '#' + idReq;
  $(tableId_string + ' tr').each(function () {
    const reqId = $(reqId_string).val();
    const reqId_table = $(this).find("td:first").html();
    const reqObject = {
      reqId,
      status
    };
    if (reqId_table === reqId) {
      // Đầu tiên, cập nhật status của nó dưới db
      $.ajax({
        url: "http://localhost:3000/request/status",
        type: "PATCH",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        data: JSON.stringify(reqObject),
        dataType: "json",
      }).done(function () {
        // sau khi cập nhật thành công thì reload lại table (query db để ghi đè lên lại)
        // App#2 cũng phải tự realtime vs chính nó (nhiều app#2)
        $.ajax({
          url: "http://localhost:3000/requests/unidentified+identified",
          type: "GET",
          dataType: "json"
        }).done(function (data) {
          // đồng thời emit cho app#3 biết, để cùng realtime
          socket.emit("2_to_3_reload-table");
          // reload app#2
          socket.emit("2_to_2_reload-table", data);
        });
      });
    }
  });
}

$(function () {
  // lắng nghe realtime của app#2
  socket.on("2_to_2_reload-table", (data) => {
    var source = document.getElementById("request-template").innerHTML;
    var template = Handlebars.compile(source);
    var html = template(data);
    $("#requests").html(html);
  });

  // lắng nghe realtime từ app#4
  socket.on("4_to_2_reload-table", () => {
    $.ajax({
      url: "http://localhost:3000/requests/unidentified+identified",
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