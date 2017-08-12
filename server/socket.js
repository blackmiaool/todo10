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
const wechat = require('./wechat');
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
    return new Promise((resolve) => {
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
class TopUserMap {
    constructor() {
        this.idMap = {};
        this.nameMap = {};
    }
    set(id, user) {
        this.idMap[id] = user;
        this.nameMap[user.name] = user;
    }
    getName(id) {
        return this.getFromId(id).name;
    }
    getFromName(name) {
        return this.nameMap[name];
    }
    getFromId(id) {
        return this.idMap[id];
    }

}
let topUserMap = new TopUserMap();

function handleTopUserList(list) {
    list.forEach((user) => {
        if (wechat.userNameMap[user.name]) {
            user.hasWechat = true;
        } else {
            user.hasWechat = false;
        }
    });
    list.forEach((user) => {
        topUserMap.set(user.uid, user);
    });
}

wechat.afterMounted(() => {
    db.getUserList().then(handleTopUserList);
});
db.getUserList().then(handleTopUserList);

wechat.bot.on('message', msg => {
    if (msg.MsgType === wechat.bot.CONF.MSGTYPE_STATUSNOTIFY) {
        return;
    }
    const name = wechat.bot.contacts[msg.FromUserName].getDisplayName();

    switch (msg.MsgType) {
    case wechat.bot.CONF.MSGTYPE_TEXT:
        if (msg.Content === '[Smile]') {
            const user = topUserMap.getFromName(name);
            if (!user) {
                return;
            }
            todo.filter((item) => item.confirmPending && item.owner == user.uid).forEach((item, i) => {
                setTimeout(() => {
                    wechat.sendMessage(topUserMap.getName(item.requestor), `【${name}】接受了你创建的任务【${item.title}】`);
                    item = todo.getTodo(item.id);
                    item.confirmPending = false;
                    todo.edit(item.id, item);
                }, i * 5000);
            });
        }
    }
});

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
            if (!id) {
                id = topUserMap.getName(socket.context.uid);
            }
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
            await todo.unwatch(data.id, socket.context.uid);
            return {
                list: todo.getList(socket.context.uid)
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
        $on('transfer', async function ({
            id,
            uid
        }) {
            await todo.transfer(id, uid);
            const item = todo.getTodo(id);
            wechat.sendMessage(topUserMap.getName(uid), `【${topUserMap.getName(socket.context.uid)}】把任务：【${item.title}】移交给了你。
详情参见 http://${config.domain}:${config.clientPort}\/#\/view?id=${id}`);
            if (item.requestor != socket.context.uid) {
                wechat.sendMessage(topUserMap.getName(item.requestor), `【${topUserMap.getName(socket.context.uid)}】把任务：【${item.title}】移交给了【${topUserMap.getName(uid)}】。
详情参见 http://${config.domain}:${config.clientPort}\/#\/view?id=${id}`);
            }

            return {
                list: todo.getList(socket.context.uid)
            };
        }, false);
        $on('finish', async function (id) {
            console.log('id', id, userMap[id]);
            const item = todo.getTodo(id);
            item.status = 'done';
            wechat.sendMessage(topUserMap.getName(item.requestor), `【${item.title}】任务被【${topUserMap.getName(socket.context.uid)}】完成了哦～  
详情参见 http://${config.domain}:${config.clientPort}\/#\/view?id=${id}`);
            await todo.edit(id, item);
            const list = todo.getList(socket.context.uid);
            return {
                id,
                list
            };
        }, true);
        $on('create', async function (item) {
            item.status = 'pending';
            const $owner = topUserMap.getFromId(item.owner);
            const $requestor = topUserMap.getFromId(item.requestor);
            if ($owner.hasWechat && $requestor.hasWechat) {
                item.confirmPending = true;
            }

            const id = await todo.create(item);
            if (item.attachments) {
                item.attachments = item.attachments.map((path) => {
                    return path.replace(/files\/[^\/]+\//, `files\/${id}\/`);
                });
            }
            await todo.edit(id, item);
            let message = `【${$requestor.name}】 给你分配了任务【${item.title}】
详情参见 http://${config.domain}:${config.clientPort}\/#\/view?id=${id}`;
            console.log('$requestor', $requestor)
            if ($requestor.hasWechat) {
                message += '\n回复[Smile]可以通知TA你接受了任务';
            }

            wechat.sendMessage($owner.name, message);
            const list = todo.getList(socket.context.uid);
            await new Promise((resolve) => {
                const dir = `./public/files/${topUserMap.getName(socket.context.uid)}`;
                fs.rename(dir, `./public/files/${id}`, () => {
                    resolve();
                });
            });
            return {
                id,
                list
            };
        }, true);

        $on('edit', async function (data) {
            const id = data.id;
            await todo.edit(id, data);
            const list = todo.getList(socket.context.uid);
            return {
                id,
                list
            };
        }, true);

        let user;
        socket.on('getUserList', async(data, cb) => {
            // if (!socket.context.uid) {
            //     return cb(errorMap[13]);
            // }
            const list = await db.getUserList();
            handleTopUserList(list);



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
