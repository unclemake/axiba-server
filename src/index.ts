import * as fs from 'fs';
import * as express from 'express';
import * as http from 'http';
import * as socketIO from 'socket.io';
import config from './config';
import open = require("open");
import * as ph from 'path';
import nodeFile from 'axiba-npm-dependencies';

var record = require('./record.json');

/**
 * 静态服务器
 * 
 * @class Server
 */
class Server {
    /**
     * Creates an instance of Server.
     * 
     * 
     * @memberOf Server
     */
    constructor() {
        var app = express();

        app.get('/', function (req, res) {
            res.sendfile(config.mainPath);
        });

        /**
         * 监听 666
         */
        var server = app.listen(config.webPort, function () {
            var host = server.address().address;
            var port = server.address().port;
            console.log('Example app listening at http://%s:%s', host, port);
        });

        //静态文件访问
        app.use(express.static('./'));

    }
}


/**
 * 长连接
 * 
 * @class Socket
 */
class Socket {
    /**
     * Creates an instance of Socket.
     * 
     * 
     * @memberOf Socket
     */
    constructor() {
        var server = http.createServer();
        var io = socketIO(server);
        io.on('connection', (client) => {
            this.socket = client;
            this.event();
        });
        server.listen(config.devPort);

    }

    /**
     * 连接
     * 
     * @type {SocketIO.Socket}
     * @memberOf Socket
     */
    socket: SocketIO.Socket

    /**
     * 刷新web页面
     * 
     * 
     * @memberOf Socket
     */
    reload() {
        this.socket.emit('reload', {});
    }

    /**
     * 绑定事件
     * 
     * 
     * @memberOf Socket
     */
    private event() {
        this.socket.on('message', function (data) {
            console.log(data);
        });
    }
}



/**
 * dev文件名类
 * 
 * @class DevFile
 */
class DevFile {

    /**
     * 模块名混淆
     * 
     * 
     * @memberOf DevFile
     */
    devPath = '__dev__';


    /**
     * 添加模块 define 的头
     * 
     * @param {any} content
     * @param {any} path
     * @param {string} [devPaths=this.devPath]
     * @returns
     * 
     * @memberOf DevFile
     */
    addDefine(content, path, devPaths: string = this.devPath) {
        content = `\ndefine("${devPaths ? devPaths + '/' : ''}${path}",function(require, exports, module) {\n${content}\n});\n`;
        return content;
    }

    /**
     * 根据名字获取所有webdev文件
     * 
     * @param {string} name
     * @returns
     * 
     * @memberOf DevFile
     */
    getFile(name: string) {
        return fs.readFileSync(`${ph.resolve(__dirname, '..')}/${name}.js`);
    }

    /**
     * 获取dev文件
     * 
     * @returns
     * 
     * @memberOf DevFile
     */
    get() {
        let content = '';

        let fileArray = [
            'web/index',
            'src/config',
            'web/socket-client'
        ]

        fileArray.forEach(value => {
            content += this.addDefine(this.getFile(value), `${value}.js`);
        })

        let mF = nodeFile.getFileString('socket.io-client');
        content += this.addDefine(mF, 'socket.io-client', '');

        content += `seajs.use('${this.devPath}/web/index.js');\n`;

        return content;
    }
}

let server: Server;
let devFile = new DevFile();

export let socket: Socket;

/**
 * 运行服务器
 * 
 * @export
 */
export function run() {
    server = new Server();
    socket = new Socket();
}

/**
 * 在谷歌里面打开连接
 * 
 * @export
 * @param {boolean} [bl=false]
 */
export function openWeb(bl = false) {
    let day = new Date().getDay();
    if (record.openTime != day || bl) {
        record.openTime = day;
        fs.writeFileSync(`${__dirname}/record.json`, JSON.stringify(record));
        open(`http://localhost:${config.webPort}/`, 'chrome');
    }
}

/**
 * 获得devfile
 * 
 * @export
 * @returns
 */
export function getDevFileString() {
    return devFile.get();
}

export { config };