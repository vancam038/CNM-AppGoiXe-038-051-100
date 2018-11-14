var socket = io("http://localhost:3001");

function validateString(data) {
  if (data === undefined || data === '') {
    return false;
  }
  return true;
}

$(function () {
  let dataTable = null;
  dataTable = $("#reqTable").DataTable({
    paging: false,
    lengthChange: false,
    info: false,
    searching: false,
    language: {
      emptyTable: "Hiện chưa có request mới nào được submit"
    }
  });
  $.ajax({
    url: "http://localhost:3000/request/unidentified",
    type: "GET",
    dataType: "json",
    timeout: 10000
  }).done(function (data) {
    if (dataTable) {
      dataTable.destroy();
      dataTable = null;
    }
    var source = document.getElementById("request-template").innerHTML;
    var template = Handlebars.compile(source);
    var html = template(data);
    $("#requests").html(html);
    dataTable = $("#reqTable").DataTable({
      paging: false,
      scrollY: 350,
      lengthChange: false,
      info: false,
      searching: false
      // createdRow: function (row) {
      //   const btn_locate = $("button.btn-locate", row)[0];
      //   if (btn_locate)
      //     $(btn_locate).click(function () {
      //       const tr = $(btn_locate).closest("tr")[0];
      //       const reqId = $(tr).attr("data-id"),
      //         lat = $(tr).attr("data-lat"),
      //         lng = $(tr).attr("data-lng");
      //       if (reqId === undefined || lat === undefined || lng === undefined)
      //         return;
      //       prevLatLng = new google.maps.LatLng(lat, lng);
      //       handleQueryGeolocationFinish(prevLatLng);
      //     });

      //   const btn_find = $("button.btn-find", row)[0];
      //   if (btn_find)
      //     $(btn_find).click(function () {
      //       const tr = $(btn_find).closest("tr")[0];
      //       const reqId = $(tr).attr("data-id"),
      //         lat = $(tr).attr("data-lat"),
      //         lng = $(tr).attr("data-lng");
      //       if (reqId === undefined || lat === undefined || lng === undefined)
      //         return;
      //       // cam-sv start
      //       socket.emit(
      //         "2_to_4_send-req-to-driver",
      //         JSON.stringify({
      //           reqId,
      //           lat,
      //           lng
      //         })
      //       );
      //       // cam-sv end
      //     });
      // }
    });
  });

  socket.on("new_request_added", () => {
    $.ajax({
      url: "http://localhost:3000/request/unidentified",
      type: "GET",
      dataType: "json",
      timeout: 10000
    }).done(function (data) {
      if (dataTable) {
        dataTable.destroy();
        dataTable = null;
      }
      var source = document.getElementById("request-template").innerHTML;
      var template = Handlebars.compile(source);
      var html = template(data);
      $("#requests").html(html);
      dataTable = $("#reqTable").DataTable({
        paging: false,
        scrollY: 350,
        lengthChange: false,
        info: false,
        searching: false
        // createdRow: function (row) {
        //   const btn_locate = $("button.btn-locate", row)[0];
        //   if (btn_locate)
        //     $(btn_locate).click(function () {
        //       const tr = $(btn_locate).closest("tr")[0];
        //       const reqId = $(tr).attr("data-id"),
        //         lat = $(tr).attr("data-lat"),
        //         lng = $(tr).attr("data-lng");
        //       console.log(reqId, lat, lng);
        //       if (reqId === undefined || lat === undefined || lng === undefined)
        //         return;
        //       prevLatLng = new google.maps.LatLng(lat, lng);
        //       handleQueryGeolocationFinish(prevLatLng);
        //     });
        // }
      });
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
    const lat = $(this).attr("data-lat");
    const lng = $(this).attr("data-lng");
    $('#lat').val(lat);
    $('#lng').val(lng);
  });

  $(".btn-locate").click(function () {
    const reqId = $('#reqId').val();
    const lat = $('#lat').val();
    const lng = $('#lng').val();
    // console.log(getStatusByReqId('reqTable', 'reqId'));
    if (!validateString(reqId) || !validateString(lat) || !validateString(lng) /*|| status != unidentified*/) {
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