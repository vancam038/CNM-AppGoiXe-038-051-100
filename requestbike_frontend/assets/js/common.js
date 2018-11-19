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

function showSuccessMsg(msg) {
    alertify.set('notifier', 'position', 'bottom-right');
    alertify.success(msg);
}

function showErrorMsg(msg) {
    alertify.set('notifier', 'position', 'bottom-right');
    alertify.error(msg);
}