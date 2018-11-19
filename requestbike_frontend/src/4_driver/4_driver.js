var socket = io("http://localhost:3001");

$(function () {
    $("#requestModalCenter").modal({
        backdrop: "static",
        // mặc định khi init, sẽ show modal. Nếu ko mún show thì chỉnh thành false
        show: false
    });
});

function changeStatus(status) {
    switch (status) {
        case "READY":
            $("#navbarDropdown").html("READY");
            $("#navbarDropdown")
                .removeClass("btn-outline-danger btn-outline-warning")
                .addClass("btn-outline-success");
            break;
        case "STANDBY":
            $("#navbarDropdown").html("STANDBY");
            $("#navbarDropdown")
                .removeClass("btn-outline-success btn-outline-danger")
                .addClass("btn-outline-warning");
            //socket start
            //socket end
            break;
            //etc...
        case "BUSY":
            $("#navbarDropdown").html("BUSY");
            $("#navbarDropdown")
                .removeClass("btn-outline-success btn-outline-warning")
                .addClass("btn-outline-danger");
            //socket start
            //socket end
            break;
    }
}

function updateReqStatus(reqId) {
    const status = "ACCEPTED";
    const reqObject = {
        reqId,
        status
    };

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
        // sẽ làm gì đây
        // emit cho 3 thôi là đã có xe nhận -> hãy reload table lại đi
        socket.emit("4_to_3_reload-table");
    });
}
//socket start

//listen start
$(function () {
    // gửi trạng thái lên cho server
    // socket.emit("4_to_2_???", requestObject);

    // lắng nghe yêu cầu từ phía #2
    var timer = new Timer();
    socket.on("2_to_4_send-req-to-driver", msg => {
        const {
            reqId,
            lat,
            lng
        } = JSON.parse(msg);
        if (reqId === undefined || lat === undefined || lng === undefined) return;

        // start đồng hồ
        if (timer.isRunning() == false) {
            timer.start({
                countdown: true,
                startValues: {
                    seconds: 10
                }
            });
            $("#countdownExample #timer-value").html(timer.getTimeValues().seconds);
            timer.addEventListener("secondsUpdated", function (e) {
                $("#countdownExample #timer-value").html(timer.getTimeValues().seconds);
                // khi click button chấp nhận
                $('#btn-accept').click(() => {
                    updateReqStatus(reqId);
                    passengerLatLng = new google.maps.LatLng(lat, lng);
                    drawPassengerMarker(passengerLatLng);
                    drawPathDriverToPassenger(prevLatLng, passengerLatLng);
                })

                $('#btn-reject').click(() => {
                    timer.stop();
                    // timer.reset();
                    $("#requestModalCenter").modal("hide");
                })
            });

            timer.addEventListener("targetAchieved", function (e) {
                $("#countdownExample #timer-value")
                    .html("Không phản hồi")
                    .addClass("timer-timeout");
                setTimeout(function () {
                    $("#requestModalCenter").modal("hide");
                    $("#countdownExample #timer-value").removeClass("timer-timeout");
                }, 500);
            });

            // hiện modal accept
            $("#requestModalCenter").modal("show");
        }
    });
});
//socket end