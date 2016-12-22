"use strict";
const io = require('socket.io-client');
function run() {
    var socket = io.connect(`/`);
    socket.on('reload', function (msg) {
        window.location.reload();
    });
    socket.emit('message', '连接成功！');
}
exports.run = run;

//# sourceMappingURL=socket-client.js.map
