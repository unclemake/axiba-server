"use strict";
const fs = require('fs');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const config_1 = require('./config');
exports.config = config_1.default;
const open = require("open");
const ph = require('path');
const axiba_npm_dependencies_1 = require('axiba-npm-dependencies');
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
            res.sendfile(config_1.default.mainPath);
        });
        /**
         * 监听 666
         */
        var server = app.listen(config_1.default.webPort, function () {
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
        server.listen(config_1.default.devPort);
    }
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
    event() {
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
    constructor() {
        /**
         * 模块名混淆
         *
         *
         * @memberOf DevFile
         */
        this.devPath = '__dev__';
    }
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
    addDefine(content, path, devPaths = this.devPath) {
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
    getFile(name) {
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
        ];
        fileArray.forEach(value => {
            content += this.addDefine(this.getFile(value), `${value}.js`);
        });
        let mF = axiba_npm_dependencies_1.default.getFileString('socket.io-client');
        content += this.addDefine(mF, 'socket.io-client', '');
        content += `seajs.use('${this.devPath}/web/index.js');\n`;
        return content;
    }
}
let server;
let devFile = new DevFile();
/**
 * 运行服务器
 *
 * @export
 */
function run() {
    server = new Server();
    exports.socket = new Socket();
}
exports.run = run;
/**
 * 在谷歌里面打开连接
 *
 * @export
 * @param {boolean} [bl=false]
 */
function openWeb(bl = false) {
    let day = new Date().getDay();
    if (record.openTime != day || bl) {
        record.openTime = day;
        fs.writeFileSync(`${__dirname}/record.json`, JSON.stringify(record));
        open(`http://localhost:${config_1.default.webPort}/`, 'chrome');
    }
}
exports.openWeb = openWeb;
/**
 * 获得devfile
 *
 * @export
 * @returns
 */
function getDevFileString() {
    return devFile.get();
}
exports.getDevFileString = getDevFileString;

//# sourceMappingURL=index.js.map
