function setStatusByReqId(tableId, idReq, status) {
    const tableId_string = '#' + tableId;
    const reqId_string = '#' + idReq;
    $(tableId_string + ' tr').each(function () {
        const reqId = $(reqId_string).val();
        const reqId_table = $(this).find("td:first").html();
        const reqObject = {
            reqId,
            status
        };

        if (reqId_table === reqId) {
            // tạm thời set cứng html -> đúng ra là phải query từ db để ghi đè lên lại
            // $(this).find("td:last").html(status);
            $.ajax({
                url: "http://localhost:3000/request/status",
                type: "PATCH",
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(reqObject),
                dataType: "json",
            }).done(function (data) {
                $.ajax({
                    url: "http://localhost:3000/requests",
                    type: "GET",
                    dataType: "json"
                }).done(function (data) {
                    var source = document.getElementById("request-template").innerHTML;
                    var template = Handlebars.compile(source);
                    var html = template(data);
                    $("#requests").html(html);
                });
            });
            return true;
        }
    });
}

function validateString(data) {
    if (data === undefined || data === '') {
        return false;
    }
    return true;
}