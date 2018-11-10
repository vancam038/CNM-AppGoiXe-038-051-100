$(function () {
    $.ajax({
        url: 'http://localhost:3000/api/requestReceiver/request',
        type: 'GET',
        dataType: 'json',
        timeout: 10000
    }).done(function (data) {
        var source = document.getElementById("request-template").innerHTML;
        var template = Handlebars.compile(source);
        var html = template(data);
        $('#requests').html(html);
    })
});