function setStatusByReqId(tableId, idReq, status_string) {
    const tableId_string = '#' + tableId;
    const reqId_string = '#' + idReq;
    $(tableId_string + ' tr').each(function () {
        const reqId = $(reqId_string).val();
        const reqId_table = $(this).find("td:first").html();
        console.log(reqId);
        if (reqId_table === reqId) {
            // tạm thời set cứng html -> đúng ra là phải query từ db để ghi đè lên
            $(this).find("td:last").html(status_string).addClass(status_string);
            return true;
        }
    });
}

function getStatusByReqId(reqId) {
    // get lại từ trong database
}