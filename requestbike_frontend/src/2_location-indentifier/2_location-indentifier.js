var socket = io('http://localhost:3001');

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
    socket.on('1_to_2_transfer-req', reqs => {
        console.log(reqs);
        if (dataTable) {
            dataTable.destroy();
            dataTable = null;
        }
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

    $('#confirm-geocode').click(() => {
        confirm('Tọa độ mới đã đúng với địa chỉ khách gửi chưa?');
    })
});

function initMap() {

    /// google map start
    var myMap, marker;

    var geocode = {
        lat: -25.344,
        lng: 131.036
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