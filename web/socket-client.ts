import * as io from 'socket.io-client';

export function run() {
    var socket = io.connect(`/`);
    socket.on('reload', function (obj) {
        window['__reload'] && (window as any).__reload(obj);
    });
    socket.emit('message', '连接成功！');
}


