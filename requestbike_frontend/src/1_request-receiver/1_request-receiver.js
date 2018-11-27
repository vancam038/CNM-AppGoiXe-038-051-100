var socket = io("http://localhost:3001");
$(function(){
    let showModal = () => {
        $('#modalUnauthorized').modal('show');
        $('.modal-backdrop').show();
    };
  $.ajax({
      url:"http://localhost:3000/user/me",
      type:"POST",
      headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
          "x-access-token": localStorage.getItem('token_1')
      },
      dataType: 'json',
      success:function(data, status, jqXHR){
        console.log(data);
      },
      error:function(e){
          //Handle auto login
          $.ajax({
              url:'http://localhost:3000/auth/token',
              type:'POST',
              headers:{
                  "Access-Control-Allow-Origin": "*",
                  "Content-Type": "application/json",
                  "x-ref-token": localStorage.getItem('refToken_1')
              },
              dataType:'json',
              success:function(data){
                  console.log('GET new token success');
                  //Update access-token
                 localStorage.setItem('token_1',data.access_token);
              },
              error: function(jqXHR, txtStatus, err){
                  console.log('Get new token failed');
                  console.log(err);
                  showModal();
              }
          });

      }
  })
});
$(function () {
  // init thì hide aler
  $("form").on("submit", function (e) {
    e.preventDefault();
    const clientName = $("#clientName").val();
    const phone = $("#phone").val();
    const address = $("#address").val();
    const note = $("#note").val();
    const status = REQ_STATUS_UNIDENTIFIED;
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
        "Content-Type": "application/json",
          'x-access-token':localStorage.getItem('token_1')
      },
      data: JSON.stringify(requestObject),
      dataType: "json",
      success: function () {
        $("#alert-success").show(200);
        $("#alert-danger").hide();
        setTimeout(function () {
          $("#alert-success").hide(200);
        }, 3000);

        $("#clientName").val("");
        $("#phone").val("");
        $("#address").val("");
        $("#note").val("");

        // Socket
        socket.emit("1_to_2_transfer-req");
        // socket.emit('1_to_3_transfer-req', "#1 transfer req #3 through socket");
      },
      error: function () {
        $("#alert-success").hide();
        $("#alert-danger").show(200);
        setTimeout(function () {
          $("#alert-danger").hide(200);
        }, 3000);

      }
    });
    // $("#alert-success").show(200);
    // $("#alert-danger").hide();
    // socket.emit("1_to_2_transfer-req", requestObject);
  });
});

