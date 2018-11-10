// $(function () {
//     $('#form').on('submit', function (e) {
//         e.preventDefault();
//         var clientName = $('#clientName').val();
//         var phone = $('#phone').val();
//         var address = $('#address').val();
//         var note = $('#note').val();
//         var requestObject = {
//             clientName,
//             phone,
//             address,
//             note
//         }
//         $.ajax({
//             url: 'http://localhost:3000/api/requestReceiver/request',
//             type: 'GET',
//             headers: {
//                 "Access-Control-Allow-Origin": "*",
//                 "Content-Type": "application/json"
//             },
//             // data: JSON.stringify(requestObject),
//             // dataType: "json",
//             success: function (data) {
//                 console.log(data);
//             },
//             error: function () {
//                 console.log('error');
//             }
//         });
//     });
// });

var socket = io('http://localhost:3001');

$(function () {
    $('form').on('submit', function (e) {
        e.preventDefault();
        var clientName = $('#clientName').val();
        var phone = $('#phone').val();
        var address = $('#address').val();
        var note = $('#note').val();
        var requestObject = {
            clientName,
            phone,
            address,
            note
        }
        $.ajax({
            url: 'http://localhost:3000/api/requestReceiver/request',
            type: 'POST',
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            data: JSON.stringify(requestObject),
            dataType: "json",
            success: function () {
                // console.log('Success');
                alert('Submit OK!!!');
                $('#clientName').val('');
                $('#phone').val('');
                $('#address').val('');
                $('#note').val('');
            },
            error: function () {
                // console.log('Error');
                alert('Error');
            }
        });

        // Socket 

        socket.emit('request', requestObject);
        return false;
        // })
    });
});