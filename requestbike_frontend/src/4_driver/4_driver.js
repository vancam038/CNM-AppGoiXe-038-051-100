$(function () {
    $('.timer').startTimer();
})

$(function () {
    $("#requestModalCenter").modal({
        backdrop: "static"
        // mặc định khi init, sẽ show modal. Nếu ko mún show thì chỉnh thành true
        // ,show: false
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