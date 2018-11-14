var socket = io("http://localhost:3001");

$(function () {

})

$(function () {
    $("#requestModalCenter").modal({
        backdrop: "static",
        // mặc định khi init, sẽ show modal. Nếu ko mún show thì chỉnh thành true
        show: false
    });
})

function initMap() {

    /// google map start
    var myMap, marker;

    var geocode = {
        lat: 10.762622,
        lng: 106.660172
    };

    myMap = new google.maps.Map(document.getElementById('map'), {
        center: geocode,
        zoom: 12,
        scrollwheel: false
    });

    marker = new google.maps.Marker({
        position: geocode,
        map: myMap,
        animation: google.maps.Animation.BOUNCE,
        icon: {
            url: '../../assets/img/driver.png',
            scaledSize: {
                width: 50,
                height: 50
            }
        }
    });

    // google map end
};

function changeStatus(status) {
    switch (status) {
        case 'READY':
            $('#navbarDropdown').html('READY');
            $('#navbarDropdown').removeClass('btn-outline-danger btn-outline-warning').addClass('btn-outline-success');
            break;
        case 'STANDBY':
            $('#navbarDropdown').html('STANDBY');
            $('#navbarDropdown').removeClass('btn-outline-success btn-outline-danger').addClass('btn-outline-warning');
            //socket start
            //socket end
            break;
            //etc... 
        case 'BUSY':
            $('#navbarDropdown').html('BUSY');
            $('#navbarDropdown').removeClass('btn-outline-success btn-outline-warning').addClass('btn-outline-danger');
            //socket start
            //socket end
            break;
    }
}

//socket start

//listen start
$(function () {

    // gửi trạng thái lên cho server
    // socket.emit("4_to_2_???", requestObject);

    // lắng nghe yêu cầu từ phía #2
    var timer = new Timer();
    socket.on("2_to_4_send-req-to-driver", (msg) => {
        console.log(msg);
        // start đồng hồ

        if (timer.isRunning() == false) {
            timer.start({
                countdown: true,
                startValues: {
                    seconds: 10
                }
            });
            $('#countdownExample #timer-value').html(timer.getTimeValues().seconds);
            timer.addEventListener('secondsUpdated', function (e) {
                $('#countdownExample #timer-value').html(timer.getTimeValues().seconds);
            });
            timer.addEventListener('targetAchieved', function (e) {
                $('#countdownExample #timer-value').html('Không phản hồi').addClass('timer-timeout');
                $("#requestModalCenter").modal('hide');
            });

            // hiện modal accept
            $("#requestModalCenter").modal('show');
        }
    })
})
//socket end