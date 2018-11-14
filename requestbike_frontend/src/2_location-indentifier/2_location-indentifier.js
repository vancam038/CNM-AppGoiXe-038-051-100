var socket = io("http://localhost:3001");

$(function() {
  let dataTable = null;
  dataTable = $("#reqTable").DataTable({
    paging: false,
    lengthChange: false,
    info: false,
    language: {
      emptyTable: "Hiện chưa có request mới nào được submit"
    }
  });

  socket.on("new_request_added", () => {
    $.ajax({
      url: "http://localhost:3000/request/unidentified",
      type: "GET",
      dataType: "json",
      timeout: 10000
    }).done(function(data) {
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
        info: true,
        language: {
          info: "Total: _TOTAL_ requests"
        },
        createdRow: function(row) {
          const btn_locate = $("button.btn-locate", row)[0];
          if (btn_locate)
            $(btn_locate).click(function() {
              const tr = $(btn_locate).closest("tr")[0];
              const reqId = $(tr).attr("data-id"),
                lat = $(tr).attr("data-lat"),
                lng = $(tr).attr("data-lng");
              console.log(reqId, lat, lng);
              if (reqId === undefined || lat === undefined || lng === undefined)
                return;
              prevLatLng = new google.maps.LatLng(lat, lng);
              handleQueryGeolocationFinish(prevLatLng);
            });
        }
      });
    });
  });
});

function sendReqToDriver() {
  // cam-sv start
  socket.emit("2_to_4_send-req-to-driver", "#2 gửi tọa độ req cho #4");
  // cam-sv end
}
