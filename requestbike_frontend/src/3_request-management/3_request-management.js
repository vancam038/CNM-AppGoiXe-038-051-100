var socket = io('http://localhost:3001');

function destroyDTB(dataTable) {
    if (dataTable) {
        dataTable.destroy();
        dataTable = null;
    }
}

$(function () {
    let dataTable = null;

    dataTable = $('#reqTable').DataTable({
        "paging": false,
        "lengthChange": false,
        "info": false,
        "language": {
            "emptyTable": "Hiện chưa có request mới nào được submit"
        }
    });

    $.ajax({
        url: 'http://localhost:3000/requests',
        type: 'GET',
        dataType: 'json',
        timeout: 10000
    }).done(function (data) {
        destroyDTB(dataTable);
        var source = document.getElementById("request-template").innerHTML;
        var template = Handlebars.compile(source);
        var html = template(data);
        $('#requests').html(html);
        dataTable = $('#reqTable').DataTable({
            "paging": false,
            "scrollY": 250,
            "info": false,
            "lengthChange": false
        });
    })



    // 1_to_3_transfer-req
    socket.on('1_to_3_transfer-req', reqs => {
        console.log(reqs);
        destroyDTB(dataTable);
        var source = document.getElementById("request-template").innerHTML;
        var template = Handlebars.compile(source);
        var html = template(reqs);
        $('#requests').html(html);

        dataTable = $('#reqTable').DataTable({
            "paging": false,
            "scrollY": 250,
            "lengthChange": false,
            "info": true,
            "language": {
                "info": "Total: _TOTAL_ requests",
            }
        });
    })
});

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
            url: '../../assets/img/man.png',
            scaledSize: {
                width: 50,
                height: 50
            }
        }
    });

    // google map end
};