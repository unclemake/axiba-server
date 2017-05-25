import * as fs from 'fs';
import * as express from 'express';
import * as http from 'http';
import * as socketIO from 'socket.io';
import config from './config';
import open = require("open");
import * as ph from 'path';
import nodeFile from 'axiba-npm-dependencies';
var bodyParser = require('body-parser');
var record = require('./record.json');
import { default as dep, DependenciesModel } from 'axiba-dependencies';

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
        app.use(bodyParser.json()); // for parsing application/json
        app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

        app.get('/', function (req, res) {
            res.sendFile(config.mainPath);
        });

        app.post('/data', (req, res) => {
            res.json(req.body);
        });


        app.post('/msg', (req, res) => {
            res.send('文本');
        });

        app.get('/sse', function (req, res) {
            res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" });
            res.write("retry: 10000\n");
            let data = {
                url: '/assets/components/nav/index.tsx',
                data: {
                    unread: 1
                }
            }
            res.write("data: " + JSON.stringify(data) + "\n\n");
            setInterval(function () {
                data.data.unread++;
                res.write("data: " + JSON.stringify(data) + "\n\n");
            }, 1000);
        });


        /**
         * 监听 666
         */
        var server = app.listen(config.webPort, function () {
            var host = server.address().address;
            var port = server.address().port;
            console.log('已经启动 http://localhost:%s', port);
        });

        var io = socketIO(server);
        io.on('connection', (client) => {
            this.socket = client;
            this.event();
        });

        //静态文件访问
        app.use(express.static('./'));

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
    reload(obj) {
        if (this.socket) {
            this.socket.emit('reload', obj);
        }
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

        this.socket.on('test', (data) => {
            this.socket.emit('test', { nu: 1 });
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

        let depObject = dep.getDependencies({
            contents: content,
            path: path
        } as any);
        let depString = '[]';

        if (depObject) {
            depString = JSON.stringify(depObject.dependent);
        }

        content = `\ndefine("${devPaths ? devPaths + '/' : ''}${path}",${depString},function(require, exports, module) {\n${content}\n});\n`;
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

        content += `axibaModular.run('${this.devPath}/web/index.js');\n`;

        return content;
    }
}

let server: Server;
let devFile = new DevFile();


export { server };


/**
 * 获得devfile
 * 
 * @export
 * @returns
 */
export function reload(file) {
    if (server) {
        server.reload(file);
    }
}


/**
 * 运行服务器
 * 
 * @export
 */
export function run() {
    server = new Server();
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