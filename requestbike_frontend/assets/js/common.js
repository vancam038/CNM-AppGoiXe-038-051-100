function setStatusByReqId(tableId, idReq, status) {
    const tableId_string = '#' + tableId;
    const reqId_string = '#' + idReq;
    $(tableId_string + ' tr').each(function () {
        const reqId = $(reqId_string).val();
        const reqId_table = $(this).find("td:first").html();
        console.log(reqId);
        console.log(status);
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
                success: function() {
                    console.log("sau khi patch thành công: " )
                },
                error: function() {
                    console.log("sau khi patch thất bại: " )
                }
            }).done(function (data) {
                console.log("sau khi click định vị: " + data)
                $.ajax({
                    url: "http://localhost:3000/requests",
                    type: "GET",
                    dataType: "json"
                }).done(function (data) {
                    // $("#reqTable").DataTable().destroy();
                    var source = document.getElementById("request-template").innerHTML;
                    var template = Handlebars.compile(source);
                    var html = template(data);
                    $("#requests").html(html);
                    // $("#reqTable").DataTable({
                    //     paging: false,
                    //     scrollY: 200,
                    //     lengthChange: false,
                    //     info: false,
                    //     searching: false
                    //     // bDestroy: true
                    // });
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