var socket = io("http://localhost:3001");

const SEND_REQUEST_ATTEMPT = 10;
const REQUEST_DRIVER_RESPONSE_TIME = 10000;

// perfect scrollbar start
$(function() {
  var ps = new PerfectScrollbar(".table-container", {
    wheelSpeed: 1,
    wheelPropagation: false,
    minScrollbarLength: 20
  });
});
// perfect scrollbar end

$(function() {
  let showModal = () => {
    $("#modalUnauthorized").modal("show");
    $(".modal-backdrop").show();
  };
  let getRequestList = function() {
    $.ajax({
      url: "http://localhost:3000/requests/unidentified+identified",
      type: "GET",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("token_2")
      },
      dataType: "json",
      timeout: 10000
    }).done(function(data) {
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
      "x-access-token": localStorage.getItem("token_2")
    },
    dataType: "json",
    success: function(data, status, jqXHR) {
      console.log(data);
      getRequestList();
    },
    error: function(e) {
      //Handle auto login
      $.ajax({
        url: "http://localhost:3000/auth/token",
        type: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
          "x-ref-token": localStorage.getItem("refToken_2")
        },
        dataType: "json",
        success: function(data) {
          console.log("GET new token success");
          //Update access-token
          localStorage.setItem("token_2", data.access_token);
          //Get request list
          getRequestList();
        },
        error: function(jqXHR, txtStatus, err) {
          console.log("Get new token failed");
          console.log(err);
          showModal();
        }
      });
    }
  });

  socket.on("new_request_added", () => {
    $.ajax({
      url: "http://localhost:3000/requests/unidentified+identified",
      type: "GET",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("token_2")
      },
      dataType: "json",
      timeout: 10000
    }).done(function(data) {
      var source = document.getElementById("request-template").innerHTML;
      var template = Handlebars.compile(source);
      var html = template(data);
      $("#requests").html(html);
      keepSelectedRow();
    });
  });
});

$(function() {
  //=================================================================
  //click on table body
  $("#reqTable tbody").on("click", "tr", function() {
    $("#reqTable tbody tr").removeClass("selected");
    $(this).addClass("selected");
    var tableData = $(this)
      .children("td")
      .map(function() {
        return $(this).text();
      })
      .get();
    $("#reqId").val(tableData[0]);
    $("#addr").val(tableData[3]);
    $("#note").val(tableData[4]);
    $("#status").val(tableData[5]);
    const lat = $(this).attr("data-lat");
    const lng = $(this).attr("data-lng");
    $("#lat").val(lat);
    $("#lng").val(lng);

    $("#btn-locate").prop("disabled", false);
    $("#btn-find").prop("disabled", false);

    // xét status:
    if (tableData[5] === REQ_STATUS_UNIDENTIFIED) {
      $("#btn-locate").prop("hidden", false);
      $("#btn-find").prop("hidden", true);
    } else {
      $("#btn-locate").prop("hidden", true);
      $("#btn-find").prop("hidden", false);
      prevLatLng = new google.maps.LatLng(lat, lng);
      showIdentifiedReq(prevLatLng);
    }
  });

  $("#btn-locate").click(function(e) {
    e.preventDefault();
    const reqId = $("#reqId").val();
    const lat = $("#lat").val();
    const lng = $("#lng").val();
    const status = $("#status").val();

    if (
      !validateString(reqId) ||
      !validateString(lat) ||
      !validateString(lng)
    ) {
      showErrorMsg("Hãy chọn một request");
      return;
    }
    prevLatLng = new google.maps.LatLng(lat, lng);
    handleQueryGeolocationFinish(prevLatLng);
  });

  function driverFinder(reqId, lat, lng, addr) {
    this.reqId = reqId;
    const ajaxOpts = {
      url: "http://localhost:3000/request/findDriver2",
      type: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("token_2")
      },
      timeout: 10000
    };
    const reqInfo = {
      reqId,
      lat,
      lng,
      addr
    };
    const reqLatLng = { lat, lng };
    let handleInterval = null;

    this.stop = function() {
      handleInterval && clearInterval(handleInterval);
    };

    this.start = function() {
      $.ajax(ajaxOpts).done(function(data) {
        // first attempt
        let { status } = data;
        if (status === "OK") {
          let { drivers } = data;
          let distances = drivers.map(driver => {
            const driverLatLng = { lat: driver.lat, lng: driver.lng };
            if (
              driverLatLng.lat === null ||
              driverLatLng.lat === undefined ||
              driverLatLng.lng === null ||
              driverLatLng.lng === undefined
            )
              return Number.MAX_SAFE_INTEGER;
            return Haversine(reqLatLng, driverLatLng);
          });
          let { driverId } = drivers[distances.indexOf(Math.min(...distances))];
          socket.emit(
            "2_to_4_send-req-to-driver",
            JSON.stringify({ reqInfo, driverId })
          );
        }

        // N - 1 attempts còn lại
        let attempt = 1;
        // tiếp tục tìm nếu chưa quá SEND_REQUEST_ATTEMPT lần
        // và chưa có driver accept
        handleInterval = setInterval(function() {
          console.log("-> reqId: ", reqId, ", attempt: ", attempt);
          $.ajax(ajaxOpts).done(function(data) {
            status = data.status;
            if (status === "OK") {
              drivers = data.drivers;
              distances = drivers.map(driver => {
                const driverLatLng = { lat: driver.lat, lng: driver.lng };
                return Haversine(reqLatLng, driverLatLng);
              });
              driverId =
                drivers[distances.indexOf(Math.min(...distances))].driverId;
              socket.emit(
                "2_to_4_send-req-to-driver",
                JSON.stringify({ reqInfo: reqInfo, driverId })
              );
            }

            attempt++;
            // setTimeout cho lượt req send cuối cùng
            setTimeout(function() {
              if (attempt >= SEND_REQUEST_ATTEMPT) {
                console.log("table reloading");
                handleInterval && clearInterval(handleInterval);
                // emit request failed, ajax set req failed then reload table app2 & app3
                const reqObject = {
                  reqId: reqId,
                  status: "NOT_FOUND"
                };
                $.ajax({
                  url: "http://localhost:3000/request/status",
                  type: "PATCH",
                  headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                    "x-access-token": localStorage.getItem("token_2")
                  },
                  data: JSON.stringify(reqObject),
                  dataType: "json"
                }).done(() => {
                  // reload table app2 & app3
                  $.ajax({
                    url:
                      "http://localhost:3000/requests/unidentified+identified",
                    type: "GET",
                    headers: {
                      "Access-Control-Allow-Origin": "*",
                      "Content-Type": "application/json",
                      "x-access-token": localStorage.getItem("token_2")
                    },
                    dataType: "json"
                  }).done(function(data) {
                    socket.emit("2_to_3_reload-table");
                    socket.emit("2_to_2_reload-table", data);
                  });
                });
              }
            }, REQUEST_DRIVER_RESPONSE_TIME + 5000);
            // nếu status === "NOT_FOUND" hoặc lỗi thì lại tiếp tục vòng lặp và timeout
          });
        }, REQUEST_DRIVER_RESPONSE_TIME + 5000);
      });
    };
  }
  const driverFinderInstances = [];
  $("#btn-find").click(function(e) {
    e.preventDefault();
    const reqId = $("#reqId").val();
    const lat = $("#lat").val();
    const lng = $("#lng").val();
    const addr = $("#addr").val();
    driverFinderInstances.push(new driverFinder(reqId, lat, lng, addr));
    driverFinderInstances[driverFinderInstances.length - 1].start();
    // duy-th end
  });

  socket.on("driver_accepted", function(reqId) {
    for (let i = 0; i < driverFinderInstances.length; i++) {
      let instance = driverFinderInstances[i];
      if (instance.reqId === reqId) {
        instance.stop();
        driverFinderInstances.splice(i, 1);
        instance = null;
        break;
      }
    }
  });
});

function keepSelectedRow() {
  $("#reqTable tr").each(function() {
    if (
      $(this)
        .children("td:first")
        .html() === $("#reqId").val()
    ) {
      $("#reqTable tr").removeClass("selected");
      $(this).addClass("selected");
    }
  });
}

function setStatusByReqId(tableId, idReq, status) {
  const tableId_string = "#" + tableId;
  const reqId_string = "#" + idReq;
  $(tableId_string + " tr").each(function() {
    const reqId = $(reqId_string).val();
    const reqId_table = $(this)
      .find("td:first")
      .html();
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
          "Content-Type": "application/json",
          "x-access-token": localStorage.getItem("token_2")
        },
        data: JSON.stringify(reqObject),
        dataType: "json"
      }).done(function() {
        // sau khi cập nhật thành công thì reload lại table (query db để ghi đè lên lại)
        // App#2 cũng phải tự realtime vs chính nó (nhiều app#2)
        $.ajax({
          url: "http://localhost:3000/requests/unidentified+identified",
          type: "GET",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
            "x-access-token": localStorage.getItem("token_2")
          },
          dataType: "json"
        }).done(function(data) {
          // đồng thời emit cho app#3 biết, để cùng realtime
          socket.emit("2_to_3_reload-table");
          // reload app#2
          socket.emit("2_to_2_reload-table", data);
        });
      });
    }
  });
}

$(function() {
  // lắng nghe realtime của app#2
  socket.on("2_to_2_reload-table", data => {
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
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("token_2")
      },
      dataType: "json"
    }).done(function(data) {
      var source = document.getElementById("request-template").innerHTML;
      var template = Handlebars.compile(source);
      var html = template(data);
      $("#requests").html(html);
      keepSelectedRow();
    });
  });
});
