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

var socket = io("http://localhost:3001");

$(function() {
  // init thì hide alert
  $(".alert").hide();

  $("form").on("submit", function(e) {
    e.preventDefault();
    const clientName = $("#clientName").val();
    const phone = $("#phone").val();
    const address = $("#address").val();
    const note = $("#note").val();
    const status = "UNIDENTIFIED";
    const date_submitted = moment().format('YYYY-MM-DD HH:mm');
    console.log(date_submitted);
    const requestObject = {
      clientName,
      phone,
      address,
      note,
      status,
      date_submitted
    };

    $.ajax({
      url: "http://localhost:3000/request",
      type: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      data: JSON.stringify(requestObject),
      dataType: "json",
      success: function() {
        $("#alert-success").show(200);
        $("#alert-danger").hide();

        $("#clientName").val("");
        $("#phone").val("");
        $("#address").val("");
        $("#note").val("");

        // Socket
        socket.emit("1_to_2_transfer-req");
        // socket.emit('1_to_3_transfer-req', "#1 transfer req #3 through socket");
      },
      error: function() {
        $("#alert-success").hide();
        $("#alert-danger").show(200);
      }
    });
    // $("#alert-success").show(200);
    // $("#alert-danger").hide();
    // socket.emit("1_to_2_transfer-req", requestObject);
  });
});
