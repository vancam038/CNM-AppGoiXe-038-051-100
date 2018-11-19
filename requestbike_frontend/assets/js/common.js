function validateString(data) {
    if (data === undefined || data === '') {
        return false;
    }
    return true;
}

function resetInput() {
    $('#reqId').val("");
    $('#addr').val("");
    $('#note').val("")
    $('#status').val("");
    $('#lat').val("");
    $('#lng').val("");
}