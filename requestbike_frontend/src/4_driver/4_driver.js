var socket = io("http://localhost:3001");
let infoWindow = null;

$(function () {
    $("#requestModalCenter").modal({
        backdrop: "static",
        // mặc định khi init, sẽ show modal. Nếu ko mún show thì chỉnh thành false
        show: false
    });
});

function updateDriverStatus(status, driverId) {
    const driverObject = {
        driverId,
        status
    };
    // Đầu tiên, cập nhật status của nó dưới db
    $.ajax({
        url: "http://localhost:3000/driver/status",
        type: "PATCH",
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        },
        data: JSON.stringify(driverObject),
        dataType: "json",
    }).done(function () {
        // socket start
        // socket end
    });
}

function changeStatus(status) {
    switch (status) {
        case DRIVER_STATUS_READY:
            $("#navbarDropdown").html(DRIVER_STATUS_READY);
            $("#navbarDropdown")
                .removeClass("btn-outline-danger btn-outline-warning")
                .addClass("btn-outline-success");
            // ajax cập nhật status của tài xế thành ready
            // updateDriverStatus(DRIVER_STATUS_READY, "tAJ1PUTcaf"); // TESTING
            break;
        case DRIVER_STATUS_STANDBY:
            $("#navbarDropdown").html(DRIVER_STATUS_STANDBY);
            $("#navbarDropdown")
                .removeClass("btn-outline-success btn-outline-danger")
                .addClass("btn-outline-warning");
            //socket start
            //socket end

            // ajax cập nhật status của tài xế thành standby
            // updateDriverStatus(DRIVER_STATUS_STANDBY, "tAJ1PUTcaf"); // TESTING
            break;
            //etc...
        case DRIVER_STATUS_BUSY: // for testing
            $("#navbarDropdown").html(DRIVER_STATUS_BUSY);
            $("#navbarDropdown")
                .removeClass("btn-outline-success btn-outline-warning")
                .addClass("btn-outline-danger");
            //socket start
            //socket end

            // ajax cập nhật status của tài xế thành ready
            break;
    }
}

function updateReqStatus(reqId) {
    const status = REQ_STATUS_ACCEPTED;
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
        // emit cho 3 là đã có xe nhận -> reload lại table
        socket.emit("4_to_3_reload-table");
        // emit cho 2 là đã có xe nhận -> reload lại table -> mất req identified bên #2
        socket.emit("4_to_2_reload-table");
    });
}

// lat:  reqLat, lng: reqLng, addr: reqAddr
function updateMap(lat, lng, addr) {
    // đóng infoWindow trước đó
    if (infoWindow) infoWindow.close();
    // đóng passengerMarker trước đó
    if (passengerMarker) passengerMarker.setMap(null);

    // driverMarker sẽ ko thể drag nữa
    driverMarker.setDraggable(false);

    passengerLatLng = new google.maps.LatLng(lat, lng);
    drawPassengerMarker(passengerLatLng);
    drawPathDriverToPassenger(prevLatLng, passengerLatLng);
    // show thông tin hành khách
    infoWindow = new google.maps.InfoWindow({
        content: `<span style="font-weight:bold">${addr}</span>`
    });
    infoWindow.open(map, passengerMarker);
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
            lng,
            addr
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
                    // update trạng thái của request dưới db
                    updateReqStatus(reqId);

                    // update lại map
                    updateMap(lat, lng, addr);

                    // TODO: GỌI ajax cập nhật tọa độ driver phụ trách request đó

                    // Mở button Đón khách lên
                    $('#btn-take').prop("disabled", false);
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

$(function () {
    // khi click button Đón Khách
    $('#btn-take').click(() => {
        // tự disable chính mình
        $('#btn-take').prop("disabled", true);
        // mở nút Bắt đầu lên
        $('#btn-start').prop("disabled", false);
        // chuyển trạng thái thành BUSY
        changeStatus(DRIVER_STATUS_BUSY);
        // disable lun trạng thái, ko cho sửa
        $("#navbarDropdown").prop("disabled", true);

        // TODO: xử lý marker driver nhảy vị trí tới marker khách

        // TODO: lúc này số lượng marker giảm còn 1 marker -> đổi marker thành chiếc xe đèo khách -> moving.png


    })

    // khi click button Bắt Đầu
    $('#btn-start').click(() => {
        // tự disable chính mình
        $('#btn-start').prop("disabled", true);

        // Ấn bắt đầu thì sẽ làm gì????
        // TODO: chọn địa điểm tới tùy ý 
        // -> bằng cách kéo thả marker trên map rồi confirm yes/no bằng infoWindow -> giống App#2

        
        // Nếu là yes -> đã tới địa điểm thương lượng -> thì mới mở nút Kết thúc lên để end chuyến đi
        // mở nút Kết Thúc lên
        // $('#btn-finish').prop("disabled", false); // chỉ khi ấn nút Yes của infoWindow thì mới mở lên

    })

    // khi click button Kết Thúc
    $('#btn-finish').click(() => {
        // tự disable chính mình
        $('#btn-finish').prop("disabled", true);

        // TODO: xử lý trạng thái: chuyển lại thành READY
        // enable lại trạng thái
        $("#navbarDropdown").prop("disabled", false);
        // chuyển thành READY
        changeStatus(DRIVER_STATUS_READY);

    })
})