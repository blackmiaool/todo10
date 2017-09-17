import {
    errorMap,
    getError,
    successData
} from "../common/error.js";
const todo = require("./todo");
// const md5 = require('md5');
const db = require('./db.js');
const fs = require('fs');
// const fs = require('fs');
const config = require("../config.js");
const request = require('request');
const {
    doUploadImage
} = require('./uploadImg');
const {
    doLogin,
    register
} = require('./account');
// const wechat = require('./wechat');
const clientOrigin = `http://${config.domain}:${config.clientPort}`;

function getViewUrl(id) {
    return `${clientOrigin}\/#\/view?id=${id}`;
}
const mkdirp = require("mkdirp");

function doNothing() {
    //nothing
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
    getMail(id) {
        return this.getFromId(id).email;
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
    // list.forEach((user) => {
    //     if (wechat.userNameMap[user.name]) {
    //         user.hasWechat = true;
    //     } else {
    //         user.hasWechat = false;
    //     }
    // });
    list.forEach((user) => {
        topUserMap.set(user.uid, user);
    });
}

// wechat.afterMounted(() => {
//     db.getUserList().then(handleTopUserList);
// });
db.getUserList().then(handleTopUserList);

// wechat.bot.on('message', msg => {
//     if (msg.MsgType === wechat.bot.CONF.MSGTYPE_STATUSNOTIFY) {
//         return;
//     }
//     const name = wechat.bot.contacts[msg.FromUserName].getDisplayName();

//     switch (msg.MsgType) {
//         case wechat.bot.CONF.MSGTYPE_TEXT:
//             if (msg.Content === '[Smile]') {
//                 const user = topUserMap.getFromName(name);
//                 if (!user) {
//                     return;
//                 }
//                 todo.filter((item) => item.confirmPending && item.owner == user.uid).forEach((item, i) => {
//                     setTimeout(() => {
//                         wechat.sendMessage(topUserMap.getName(item.requestor), `【${name}】接受了你创建的任务【${item.title}】`);
//                         item = todo.getTodo(item.id);
//                         item.confirmPending = false;
//                         todo.edit(item.id, item);
//                     }, i * 5000);
//                 });
//             }
//             break;
//         default:
//             break;
//     }
// });

function notify(uid, content, id) {
    console.log('notify')
    const item = todo.getTodo(id);
    db.addMessage(uid, {
        createTime: Date.now(),
        content
    });
    const html = content.replace(/http\S+/g, (http) => {
        return `<a href="${http}" target="_blank">${http}</a>`;
    });
    request({
        method: "POST",
        url: "https://shopapi.io.mi.com/app/shopv3/pipe",
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        body: {
            "mail": {
                "model": "PubEditor",
                "action": "SendMail",
                "parameters": {
                    "title": `todo消息:[${item.title}]`,
                    "content": html,
                    "receivers": [topUserMap.getMail(uid)]
                }
            }
        }
        ,
        json: true
    }, function (error, response, body) {
        console.log(error);
        console.log('b', body)
    });
    // wechat.sendMessage(topUserMap.getName(uid), message);
}
function diff(source, target, uid) {
    console.log('diff', source, target);
    if (!target.history) {
        target.history = [];
    }
    for (const key in source) {
        if (key === 'history' || key === 'confirmPending') {
            continue;
        }
        if (JSON.stringify(source[key]) !== JSON.stringify(target[key])) {
            target.history.push({
                source: source[key],
                target: target[key],
                key,
                uid,
                time: Date.now(),
            });
        }
    }
    for (const key in target) {
        if (key === 'history' || key === 'confirmPending') {
            continue;
        }
        if (!source.hasOwnProperty(key)) {
            target.history.push({
                source: source[key],
                target: target[key],
                key,
                uid,
                time: Date.now(),
            });
        }
    }
}

function init(io) {
    io.on('connection', function (socket) {
        socket.context = {};
        socket.on('disconnect', function () {
            if (!socket.context.user) {
                return;
            }
            socket.context.user.disconnectClient(socket);
        });
        socket.on('upload', async ({
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
        $on('unwatch', async (data) => {
            await todo.unwatch(data.id, socket.context.uid);
            return {
                list: todo.getList(socket.context.uid)
            }
        }, true);
        $on('watch', async (data) => {
            await todo.watch(data.id, socket.context.uid);
        }, true);
        $on('uploadUrl', async (data) => {
            data = encodeURI(data);
            let url = await doUploadImage(request.get(data), data);
            if (data.match(/\.gif$/)) {
                url += "&t=raw";
            }
            return url;
        }, false);
        $on('addProject', async (data) => {
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
            const message = `【${topUserMap.getName(socket.context.uid)}】把任务：【${item.title}】移交给了你。
详情参见 ${getViewUrl(id)}`;
            notify(uid, message, id);
            if (item.requestor != socket.context.uid) {
                setTimeout(() => {
                    const message = `【${topUserMap.getName(socket.context.uid)}】把任务：【${item.title}】移交给了【${topUserMap.getName(uid)}】。
详情参见 ${getViewUrl(id)}`;
                    notify(item.requestor, message, id);
                }, 3000);
            }

            return {
                list: todo.getList(socket.context.uid)
            };
        }, false);
        $on('finish', async function (id) {
            const item = todo.getTodo(id);
            item.status = 'done';
            const message = `【${item.title}】任务被【${topUserMap.getName(socket.context.uid)}】完成了哦～  
详情参见 ${getViewUrl(id)}`;
            for (const uid in item.watchers) {
                if (uid == socket.context.uid) {
                    continue;
                }
                if (uid == item.requestor) {
                    notify(uid, '你创建的' + message, id);
                } else {
                    notify(uid, '你关注的' + message, id);
                }
            }
            await todo.edit(id, item);
            const list = todo.getList(socket.context.uid);
            return {
                id,
                list
            };
        }, true);
        $on('restore', async function (id) {
            const item = todo.getTodo(id);
            item.status = 'pending';
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
详情参见 ${getViewUrl(id)}`;
            // if ($requestor.hasWechat) {
            //     message += '\n回复[Smile]可以通知这人你接受了任务';
            // }
            notify(item.owner, message, id);
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

        $on('edit', async function (target) {
            const id = target.id;
            const source = todo.getTodo(id);
            target.history = source.history;
            target.confirmPending = source.confirmPending;
            diff(source, target, socket.context.uid);
            await todo.edit(id, target);
            const list = todo.getList(socket.context.uid);
            return {
                id,
                list
            };
        }, true);


        $on('getUserList', async function () {
            const list = await db.getUserList();
            handleTopUserList(list);
            return {
                list
            };
        });
        $on('getTodo', async function ({
            id
        }) {
            const info = todo.getTodo(id);
            return {
                info
            };
        });
        $on('getList', async function (data) {
            const list = todo.getList(socket.context.uid, data);
            return list;
        }, true);
        $on("getMessages", async function () {
            return await db.getMessageList(socket.context.uid);
        });
        $on("deleteMessage", async function (id) {
            await db.deleteMessage(id);
            return await db.getMessageList(socket.context.uid);
            // return await db.getMessageList(socket.context.uid)
        });
        socket.on('register', register);
        socket.on('login', doLogin)
    });
}
module.exports = {
    init
}
