var socket = io("http://localhost:3001");

$(function () {
  let dataTable = null;
  dataTable = $("#reqTable").DataTable({
    paging: false,
    lengthChange: false,
    info: false,
    language: {
      emptyTable: "Hiện chưa có request mới nào được submit"
    }
  });

  // $.ajax({
  //     url: 'http://localhost:3000/requests',
  //     type: 'GET',
  //     dataType: 'json',
  //     timeout: 10000
  // }).done(function (data) {
  //     var source = document.getElementById("request-template").innerHTML;
  //     var template = Handlebars.compile(source);
  //     var html = template(data);
  //     $('#requests').html(html);
  //     dataTable = $('#reqTable').DataTable({
  //         "paging": true,
  //         "lengthChange": false
  //     });
  // })

  // 1_to_2_transfer-req
  socket.on("1_to_2_transfer-req", reqs => {
    if (dataTable) {
      dataTable.destroy();
      dataTable = null;
    }
    var source = document.getElementById("request-template").innerHTML;
    var template = Handlebars.compile(source);
    var html = template(reqs);
    $("#requests").html(html);

    dataTable = $("#reqTable").DataTable({
      paging: false,
      scrollY: 350,
      lengthChange: false,
      info: true,
      language: {
        info: "Total: _TOTAL_ requests"
      }
    });
    // createdRow: function(row, data, index) {
    //   // console.log(row, data, index);
    //   const btn_locate = $("button.btn-locate", row);
    //   console.log("btn_locate", btn_locate);
    //   btn_locate.onClick(() => {
    //     // const reqId = btn_locate
    //     //   .parent()
    //     //   .parent()
    //     //   .children(":first").innerHTML;
    //     // console.log(reqId);
    //     // $.get(`http://localhost:3000/request/coords/${reqId}`)
    //     //   .then(response => response.json())
    //     //   .then(result => {
    //     //     const { status, coords } = result;
    //     //     if (status === "OK") {
    //     //       drawUserMarker(coords);
    //     //     } else {
    //     //       // message staff request not found
    //     //     }
    //     //   })
    //     //   .catch(err => {
    //     //     // message staff server error
    //     //   });
    //     console.log(index);
    //   });
    //   const btn_find = $("button.btn-find", row);
    //   console.log("btn_find", btn_find);
    //   btn_find.onClick(() => {
    //     // const reqId = btn
    //     //   .parent()
    //     //   .parent()
    //     //   .children(":first").innerHTML;
    //     // console.log(reqId);
    //     // // disable button while server finding driver
    //     // btn.attr("disabled", true);
    //     // // $.get(`http://localhost:3000/getReqCoords/${reqId}`)
    //     // //   .then(response => response.json())
    //     // //   .then(result => {
    //     // //     const { status } = result;
    //     // //     if (status !== "OK") {
    //     // //     }
    //     // //   })
    //     // //   .catch(err => {});
    //     console.log(index);
    //   });
    // }
    // });
  });
});

function sendReqToDriver() {
  // cam-sv start
  socket.emit("2_to_4_send-req-to-driver", "#2 gửi tọa độ req cho #4");
  // cam-sv end
}