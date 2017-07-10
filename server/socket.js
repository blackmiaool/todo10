import {
    registerCheck
} from "../common/check.js";
import {
    errorMap,
    getError,
    successData
} from "../common/error.js";
// const md5 = require('md5');
const db = require('./db.js');
// const roomMap = {};
// const fs = require('fs');
// const config = require("../config.js");
const uaParser = require('ua-parser-js');

function isEmptyObject(a) {
    for (var i in a) {
        return false;
    }
    return true;
}

const userMap = {}
class User {
    constructor(name, avatar) {
        Object.assign(this, {
            avatar,
            name,
            clients: []
        });
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
    static addUser(name, avatar) {
        if (!userMap[name]) {
            userMap[name] = new User(name, avatar);
        }
        return userMap[name];
    }
    static getUser(name) {
        return userMap[name];
    }
    static getAvatar(name) {
        return userMap[name] && userMap[name].avatar;
    }

}

function doNothing() {

}

function init(io) {
    io.on('connection', function (socket) {
        socket.context = {};
        socket.on('message', function ({
            room: roomName,
            type,
            content
        }, cb = doNothing) {
            if (!socket.context.name) {
                cb(errorMap[13]);
                return;
            }
        });
        socket.on('edit', async(data, cb) => {
            if (!socket.context.name) {
                cb(errorMap[13]);
                return;
            }
            const id = data.id;
            const owner = data.owner;
            const requestor = data.requestor;
            delete data.id;
            delete data.owner;
            delete data.requestor;
            await db.edit(id, JSON.stringify(data), requestor, owner);
            const list = await db.getList(socket.context.name);
            cb(list);
        });
        let user;
        socket.on('create', async(data, cb) => {
            if (!socket.context.name) {
                cb(errorMap[13]);
                return;
            }
            const owner = data.owner;
            data.status = 'pending';
            delete data.owner;
            await db.create(JSON.stringify(data), socket.context.name, owner);
            const list = await db.getList(socket.context.name);
            cb(list);
        });
        socket.on('getList', async(data, cb) => {
            if (!socket.context.name) {
                cb(errorMap[13]);
                return;
            }
            const list = await db.getList(socket.context.name);
            cb(list);
        });
        socket.on('login', (data, cb) => {
            const checkResult = registerCheck("server", data.name, data.password);
            //            console.log(data.name, socket.handshake.headers['user-agent'])

            if (checkResult) {
                checkResult.code = 1;
                cb(checkResult);
                return;
            }
            db.login(data.name, data.password).then(function (result) {
                if (socket.context.name) { //already logged in
                    const user = User.getUser(socket.context.name);
                    user.disconnectClient(socket);
                }

                user = User.addUser(result.name, result.avatar);

                const ua = uaParser(socket.handshake.headers['user-agent']);
                user.connectClient(socket, {
                    os: ua.os.name
                });
                socket.context.name = user.name;
                cb(successData({
                    name: user.name,
                    avatar: user.avatar,
                }));
            }).catch(function (result) {
                let ret;
                console.log(result);
                if (result === true) {
                    ret = getError(6);
                    ret.key = "password";
                } else {
                    ret = errorMap[1];
                }
                cb(ret);
            });
        })
    });
}
module.exports = {
    init
}
