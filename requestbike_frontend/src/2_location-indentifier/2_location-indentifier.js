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
    console.log(reqs);
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
      scrollY: 250,
      lengthChange: false,
      info: true,
      language: {
        info: "Total: _TOTAL_ requests"
      }
    });
  });

  document.getElementsByClassName("btn-locate").forEach(btn => {
    btn.onClick(() => {
      const reqId = btn.parentNode.parentNode.firstChild.innerHTML;
      $.get(`http://localhost:3000/getReqCoords/${reqId}`)
        .then(response => response.json())
        .then(result => {
          const { status, coords } = result;
          if (status === "OK") {
            drawUserMarker(coords);
          } else {
            // message staff request not found
          }
        })
        .catch(err => {
          // message staff server error
        });
    });
  });

  document.getElementsByClassName("btn-find").forEach(btn => {
    btn.onClick(() => {
      const reqId = btn.parentNode.parentNode.firstChild.innerHTML;
      // disable button while server finding driver
      btn.setAttribute("disabled", true);
      // $.get(`http://localhost:3000/getReqCoords/${reqId}`)
      //   .then(response => response.json())
      //   .then(result => {
      //     const { status } = result;
      //     if (status !== "OK") {
      //     }
      //   })
      //   .catch(err => {});
    });
  });
});
