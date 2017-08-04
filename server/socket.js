import {
    registerCheck
} from "../common/check.js";
import {
    errorMap,
    getError,
    successData
} from "../common/error.js";
const todo = require("./todo");
// const md5 = require('md5');
const db = require('./db.js');
const fs = require('fs');
const randtoken = require('rand-token');
// const fs = require('fs');
const config = require("../config.js");
const uaParser = require('ua-parser-js');
const request = require('request');
const userMap = {}
class User {
    constructor(info) {
        Object.assign(this, {
            clients: []
        }, info);
    }
    connectClient(socket, info) {
        const item = {
            socket
        };
        Object.assign(item, info);
        this.clients.push(item);
    }
    disconnectClient(socket) {
        socket.emit("logged-out", function () {

        });
        this.clients.some(function (item, i, arr) {
            if (item.socket === socket) {
                arr.splice(i, 1);
                return true;
            }
        });
    }
    static addUser(info) {
        if (!userMap[info.id]) {
            userMap[info.id] = new User(info);
        }
        return userMap[info.id];
    }
    static getUser(id) {
        return userMap[id];
    }
    static getAvatar(id) {
        return userMap[id] && userMap[id].avatar;
    }

}
const mkdirp = require("mkdirp");

function doNothing() {
    //nothing
}

function doUploadImage(stream, url) {
    let formData = {
        upload: {
            value: stream,
            options: {
                filename: `test.${url.match(/\w+$/)}`,
                contentType: `image/${url.match(/\w+$/)}`,
                name: "upload",
            }
        }
    };
    //    console.log(formData);
    return new Promise((resolve, reject) => {
        request.post({
            url: 'http://support.io.mi.srv/shop/uploadpic',
            formData,
            headers: {
                "Accept-Language": "en,zh-CN;q=0.8,zh;q=0.6",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                //"Content-Type":multipart/form-data; boundary=----WebKitFormBoundaryLUio9LersMxXLcDU
                // Cookie: ck,
                Host: "support.io.mi.srv",
                Origin: "http://support.io.mi.srv",
                Pragma: "no-cache",
                Referer: "http://support.io.mi.srv/miot_editor/dist/index.html",
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.101 Safari/537.36",
            }
        }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            resolve(JSON.parse(body).result);
        });
    });
}

function init(io) {
    io.on('connection', function (socket) {
        socket.context = {};
        socket.on('upload', async({
            data,
            name,
            id,
        }, cb) => {
            if (!socket.context.uid) {
                cb(errorMap[13]);
                return;
            }
            data = data.replace(/^data:\w*\/?[\w\-+]*;base64,/, "");
            const buff = Buffer.from(data, 'base64');
            const dir1 = `./public`;
            const dir2 = `/files/${id}`;
            const dir = dir1 + dir2;
            mkdirp(dir, function (err) {
                if (err) {
                    console.error(err)
                } else {
                    const saveUrl = `${dir1}${dir2}/${name}`
                    const fileUrl = `//${config.domain}:${config.serverPort}${dir2}/${name}`;
                    fs.writeFile(saveUrl, buff, () => {
                        cb(fileUrl);
                    });
                }
            });
        });

        function $on(event, cb, needLogin) {
            socket.on(event, function (data, socketCb = doNothing) {
                if (needLogin) {
                    if (!socket.context.uid) {
                        socketCb(errorMap[13]);
                        return;
                    }
                }
                const ret = cb(data, socketCb);
                if (ret.then) {
                    ret.then(result => {
                        socketCb(successData(result));
                    });
                } else {
                    //TODO
                }
            });
        }
        $on('unwatch', async(data) => {
            const info = await todo.unwatch(data.id, socket.context.uid);
            return {
                info
            }
        }, true);
        $on('watch', async(data) => {
            await todo.watch(data.id, socket.context.uid);
        }, true);
        $on('uploadUrl', async(data) => {
            let url = await doUploadImage(request.get(data), data);
            if (data.match(/\.gif$/)) {
                url += "&t=raw";
            }
            return url;
        }, false);
        $on('addProject', async(data) => {
            await db.addProject({
                name: data.name
            });
        }, true);
        $on('addTag', db.addTag, true);
        $on('getProjects', db.getProjects, false);

        socket.on('edit', async(data, cb) => {
            if (!socket.context.uid) {
                cb(errorMap[13]);
                return;
            }
            const id = data.id;
            await todo.edit(id, data);
            const list = await todo.getList(socket.context.uid);
            cb(successData({
                id,
                list
            }));
        });
        let user;
        socket.on('getUserList', async(data, cb) => {
            // if (!socket.context.uid) {
            //     return cb(errorMap[13]);
            // }
            const list = await db.getUserList();
            cb(successData({
                list
            }));
        });
        socket.on('getTodo', async(data, cb) => {
            // if (!socket.context.uid) {
            //     return cb(errorMap[13]);
            // }
            const info = todo.getTodo(data.id);
            cb(successData({
                info
            }));
        });
        socket.on('create', async(data, cb) => {
            if (!socket.context.uid) {
                return cb(errorMap[13]);
            }
            data.status = 'pending';
            const id = await todo.create(data);
            const list = await todo.getList(socket.context.uid);
            cb(successData({
                id,
                list
            }));
        });
        socket.on('getList', async(data, cb) => {
            if (!socket.context.uid) {
                return cb(errorMap[13]);
            }
            const list = todo.getList(socket.context.uid, data);
            cb(list);
        });
        async function register({
            name,
            email,
            password,
            avatar,
            mode
        }, cb) {
            if (!mode) { //just check data input by user
                const checkResult = registerCheck("server", 'register', name, email, password);

                if (checkResult) {
                    checkResult.code = 1;
                    cb(checkResult);
                    return;
                }
            }
            let avatarSrc;
            let buf;
            if (!mode) {
                avatarSrc = `//${config.domain}:${config.serverPort}/avatar/${name}.png`; //TODO must use config file to determine domain
                buf = Buffer.from(avatar.slice(22), 'base64');
            } else {
                avatarSrc = avatar;
                password = randtoken.generate(32);
            }

            const result = await db.register(name, email, password, avatarSrc);
            if (!result) {
                if (!mode) {
                    fs.writeFileSync(`${__dirname}/public/avatar/${name}.png`, buf);
                }
                cb(successData({
                    password,
                    name,
                    avatar,
                    email
                }));
            } else {
                if (result.code === 'SQLITE_CONSTRAINT') {
                    cb({
                        key: "name",
                        msg: "Username exists",
                    })
                } else {
                    cb({
                        key: "name",
                        msg: "Fail to write into db",
                    })
                }
            }
        }
        socket.on('register', register);
        async function doLogin(data, cb) {
            if (!data) {
                return;
            }
            let name;
            let avatar;
            let email = data.email;
            const mode = data.mode;
            if (!mode) {
                email = data.email;
                const checkResult = registerCheck("server", 'login',
                    data.name, data.email, data.password);
                if (checkResult) {
                    checkResult.code = 1;
                    cb(checkResult);
                    return;
                }
            } else {
                const {
                    getInfo
                } = require(`../port/login/${data.mode}/server.js`);
                const result = await getInfo(data.data);
                name = result.name;
                avatar = result.avatar;
                email = result.email;
            }
            if (mode && !name) {
                return cb(errorMap[21]);
            }

            db.login({
                email,
                password: data.password,
                mode
            }).then(function (result) {
                if (socket.context.uid) { //already logged in
                    const user = User.getUser(socket.context.uid);
                    user.disconnectClient(socket);
                }

                user = User.addUser(result);

                const ua = uaParser(socket.handshake.headers['user-agent']);
                user.connectClient(socket, {
                    os: ua.os.name
                });
                socket.context.uid = user.id;
                cb(successData({
                    name: user.name,
                    avatar: user.avatar,
                    password: result.password,
                    email,
                    uid: user.id,
                }));
            }).catch(function (result) {
                let ret;
                console.log(1, result);
                if (!data.mode) {
                    if (result === -1 || result === -2) {
                        ret = getError(6);
                        ret.key = "password";
                    } else {
                        ret = errorMap[1];
                    }
                    cb(ret);
                } else {
                    if (result === -1) {
                        console.log('register');
                        register({
                            name,
                            email,
                            mode,
                            avatar
                        }, function (result) {
                            if (result.code === 0) {
                                doLogin(data, cb);
                            } else {
                                cb(result);
                            }
                        });
                    }
                }
            });
        }
        socket.on('login', doLogin)
    });
}
module.exports = {
    init
}
