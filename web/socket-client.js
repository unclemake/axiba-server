"use strict";
const io = require('socket.io-client');
function run() {
    var socket = io.connect(`/`);
    socket.on('reload', function (obj) {
        window['__reload'] && window.__reload(obj);
    });
    socket.emit('message', '连接成功！');
}
exports.run = run;

//# sourceMappingURL=socket-client.js.map
