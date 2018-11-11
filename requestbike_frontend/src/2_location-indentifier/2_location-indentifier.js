var socket = io('http://localhost:3001');

$(function () {
    let dataTable = null;

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
            "paging": true,
            "lengthChange": false
        });
    })


});