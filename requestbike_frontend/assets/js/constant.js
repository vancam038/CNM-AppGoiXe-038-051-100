// REQ STATUS
const REQ_STATUS_UNIDENTIFIED = 'UNIDENTIFIED'; // chưa được định vị
const REQ_STATUS_IDENTIFIED = 'IDENTIFIED'; // đã được định vị
const REQ_STATUS_ACCEPTED = 'ACCEPTED'; // đã có xe nhận
const REQ_STATUS_MOVING = 'MOVING'; // đang di chuyển
const REQ_STATUS_FINISHED = 'FINISHED'; // đã hoàn thành
const REQ_STATUS_NOTFOUND = 'NOT_FOUND'; // không có xe nhận
const REQ_STATUS_PENDING = 'PENDING'; // đang tìm xe ...

// DRIVER STATUS
const DRIVER_STATUS_READY = 'READY'; // sẵn sàn nhận req
const DRIVER_STATUS_STANDBY = 'STANDBY'; // offline
const DRIVER_STATUS_BUSY = 'BUSY'; // đang đi đón khách, đang chở khách

// GOOGLE MAP CONSTANT
const INIT_ZOOM_LEVEL = 12;
const DEFAULT_ZOOM_LEVEL = 18;

// SEND REQUEST ATTEMPT
const SEND_REQUEST_ATTEMPT = 6;
const REQUEST_DRIVER_RESPONSE_TIME = 10000;