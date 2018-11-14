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

function changeStatus(status) {
    switch (status) {
        case 'READY':
            $('#navbarDropdown').html('READY');
            $('#navbarDropdown').removeClass('btn-outline-danger btn-outline-warning').addClass('btn-outline-success');
            break;
        case 'STANDBY':
            $('#navbarDropdown').html('STANDBY');
            $('#navbarDropdown').removeClass('btn-outline-success btn-outline-danger').addClass('btn-outline-warning');
            break;
            //etc... 
        case 'BUSY':
            $('#navbarDropdown').html('BUSY');
            $('#navbarDropdown').removeClass('btn-outline-success btn-outline-warning').addClass('btn-outline-danger');
            break;
    }
}