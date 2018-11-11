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
    // init thì hide alert
    $('.alert').hide();

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
            url: 'http://localhost:3000/request',
            type: 'POST',
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            data: JSON.stringify(requestObject),
            dataType: "json",
            success: function () {
                // console.log('Success');
                $('#alert-success').show(200);
                $('#alert-danger').hide();

                $('#clientName').val('');
                $('#phone').val('');
                $('#address').val('');
                $('#note').val('');

                // Socket 
                // Gui msg cho server: tra list request ve cho #2

                // 1_to_2_transfer-req
                socket.on('1_to_2_transfer-req', reqs => {
                    console.log(reqs);
                })

                socket.emit('1_to_2_transfer-req', "#1 transfer req #2 through socket");
            },
            error: function () {
                // console.log('Error');
                $('#alert-success').hide();
                $('#alert-danger').show(200);
            }
        });


    });
});