import {
    registerCheck
} from "../common/check.js";
import {
    errorMap,
    getError,
    successData
} from "../common/error.js";
const md5 = require('md5');
const db = require('./db.js');
const roomMap = {};
const fs = require('fs');
const config = require("../config.js");
const uaParser = require('ua-parser-js');

function getSyncData(socket) {
    return {
        avatar: socket.context.avatar,
        rooms: socket.context.rooms,
        name: socket.context.name + ""
    }
}

function isEmptyObject(a) {
    for (var i in a) {
        return false;
    }
    return true;
}

function syncRoom(socket, roomName) {

}

function getMembers(roomName) {
    const ret = {};
    const room = roomMap[roomName];

    for (const name in room) {
        const user = room[name];
        ret[name] = {
            avatar: user.avatar,
            name,
            clients: user.clients.map(function (v) {
                return {
                    os: v.os
                };
            })
        };

    }
    return ret;
}

function syncMembers(roomName, exception) {
    for (const name in roomMap[roomName]) {
        const member = roomMap[roomName][name];

        member.clients.forEach(function (client) {
            client.socket.emit("sync-members", {
                name: roomName,
                members: getMembers(roomName)
            });
        });


    }
}

function broadcaseMessage(roomName, message) {
    for (const name in roomMap[roomName]) {
        const member = roomMap[roomName][name];
        member.clients.forEach(function (client) {
            client.socket.send(message);
        });
    }
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
        for (const i in info) {
            Object.assign(item, info);
        }
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
        if (!this.clients.length) {
            this.rooms.forEach((room) => {
                if (!roomMap[room.name]) {
                    return;
                }
                delete roomMap[room.name][this.name];
                if (isEmptyObject(roomMap[room.name])) {
                    delete roomMap[room.name];
                } else {
                    syncMembers(room.name);
                }
            });
            delete userMap[this.name];
        } else {
            this.rooms.forEach((room) => {

                syncMembers(room.name);

            });
        }
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
    joinRoom(roomName) {
        if (!roomMap[roomName]) {
            roomMap[roomName] = {};
        }
        roomMap[roomName][this.name] = this;
        syncMembers(roomName);
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
            let originalName;
            if (typeof content === "object" && (type === "image" || type === "file")) {
                originalName = content.name || '';
                content = content.data;
            }

            if (type === "image" && content.length > 2e6 && content.length <= 300e6) {
                type = "file";
            }
            if (type === "file") {
                if (content.length > 300e6) { //300M
                    cb(errorMap[15]);
                    return;
                }
            } else {
                if (content.length > 2e6) {
                    cb(errorMap[15]);
                    return;
                }
            }

            if (type === "text" && content.length > 300) {
                cb(errorMap[15]);
                return;
            }
            if (!roomMap[roomName] || !roomMap[roomName][socket.context.name]) {
                cb(errorMap[7]);
                return;
            }
            if (type === 'code') {
                console.log('code content', content)
                const suffix = content.lang;
                let fingerprint;
                if (content.data.length < 5e6) {
                    fingerprint = md5(content.data);
                } else {
                    fingerprint = parseInt(Date.now());
                }
                const fileFullName = `${fingerprint}`;
                const buff = Buffer.from(content.data);
                const localPath = 'code/' + fileFullName;
                fs.writeFile('public/' + localPath, buff, function () {
                    send({
                        content: {
                            lang: content.lang,
                            src: `//${config.domain}:${config.serverPort}/getCode?name=${fileFullName}`
                        }
                    });
                });
            } else if (type === "image" || type === "file") {
                if (content.match(/^data:/)) {
                    let suffix = (originalName.match(/(\w+)$/) || content.match(/^data:image\/(\w+)/) || [])[1];
                    if (!suffix) {
                        suffix = "";
                    }
                    let fingerprint;
                    if (content.length < 5e6) {
                        fingerprint = md5(content);
                    } else {
                        fingerprint = parseInt(Date.now());
                    }

                    content = content.replace(/^data:\w*\/?[\w\-+]*;base64,/, "");
                    const buff = Buffer.from(content, 'base64');

                    let dir;
                    let fileFullName;
                    let localPath;
                    if (type === 'image') {
                        dir = "images/";
                        fileFullName = `${fingerprint}.${suffix}`;

                    } else {
                        dir = "files/";
                        fileFullName = `${Date.now()+'-'+originalName}`;
                    }
                    localPath = dir + fileFullName;
                    fs.writeFile('public/' + localPath, buff, function () {
                        if (type === "image") {
                            send({
                                content: {
                                    data: `//${config.domain}:${config.serverPort}/${localPath}`
                                }
                            });
                        } else {
                            send({
                                content: {
                                    name: originalName,
                                    data: `//${config.domain}:${config.serverPort}/getFile?name=${fileFullName}`
                                }
                            });
                        }

                    });
                } else if (content.length > 1e3) {
                    cb(errorMap[16]);
                }
            } else {
                send();
            }

            function send(extra) {
                const message = {
                    room: roomName,
                    type,
                    content,
                    name: socket.context.name,
                    avatar: socket.context.avatar,
                    time: Date.now()
                };


                for (const i in extra) {
                    message[i] = extra[i];
                }
                broadcaseMessage(roomName, message);
                if (typeof message.content === "object") {
                    message.content = JSON.stringify(message.content);
                }

                db.saveMessage(message.name, roomName, new Date(), message.type, message.content);

            }

        });

        socket.on('set-bulletin', function ({
            name: roomName,
            content,
        }, cb = doNothing) {
            if (!socket.context.name) {
                cb(errorMap[13]);
                return;
            }
            if (roomName.length > 10) {
                cb(errorMap[3]);
                return;
            }
            db.getRoomsInfo([roomName]).then(function (rooms) {
                if (socket.context.name !== rooms[0].admin) {
                    throw 17;
                }

            }).then(function () {
                return db.setRoomInfo(roomName, {
                    Bulletin: content,
                });
            }).then(function (result) {
                if (!result) {
                    cb(successData());
                } else {
                    cb(errorMap[1]);
                }
            }).catch(function (e) {
                console.log("error", e);
                cb(errorMap[e]);
            });
        });

        socket.on('get-room', function ({
            name: roomName,
        }, cb = doNothing) {
            if (!socket.context.name) {
                cb(errorMap[13]);
                return;
            }
            if (roomName.length > 10) {
                cb(errorMap[3]);
                return;
            }
            db.getRoomsInfo([roomName]).then(function (rooms) {
                rooms.forEach(function (room) {
                    room.members = getMembers(room.name);
                });

                cb(successData(rooms[0]));
            });
        });

        socket.on('get-messages', function ({
            name,
            id,
            cnt
        }, cb = doNothing) {
            if (!socket.context.name) {
                cb(errorMap[13]);
                return;
            }
            db.getRoomsHistory(name, id, cnt).then(function (msgs) {
                msgs.forEach(function (msg) {
                    msg.time = (new Date(msg.time)).getTime();
                });

                cb(successData(msgs.reverse()));
            });
        });

        socket.on('create-room', function ({
            name: roomName,
        }, cb = doNothing) {
            if (!socket.context.name) {
                cb(errorMap[13]);
                return;
            }
            if (roomName.length > 10) {
                cb(errorMap[3]);
                return;
            }
            db.createRoom(socket.context.name, roomName).then(function (result) {
                user.joinRoom(roomName);
                cb(errorMap[0]);
            }).catch(function (result) {
                console.log("result", result);
                if (result.code === 'SQLITE_CONSTRAINT') {
                    cb(errorMap[7]);
                } else {

                    cb(errorMap[1]);
                }
            });
        });
        socket.on('join-room', function ({
            name: roomName,
        }, cb = doNothing) {
            if (!socket.context.name) {
                cb(errorMap[13]);
                return;
            }
            if (roomName.length > 10) {
                cb(errorMap[3]);
                return;
            }
            db.joinRoom(socket.context.name, roomName).then(function (result) {
                user.joinRoom(roomName);
                cb(errorMap[0]);
            }).catch(function (result) {
                if (typeof result.code === "number") {
                    cb(result);
                } else {

                    cb(errorMap[1]);
                }
            });
        });
        socket.on('disconnect', function () {
            if (!socket.context.name) {
                return;
            }
            user.disconnectClient(socket);
        });
        let user;
        socket.on('get-rooms', (a, cb) => {
            if (!socket.context.name) {
                return;
            }
            db.getRoomsInfo(user.rooms.map(function (room) {
                return room.name
            })).then(function (rooms) {
                rooms.forEach(function (room) {
                    room.members = getMembers(room.name);
                });
                cb(successData(rooms));
            });

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

                db.getRoomsInfo(JSON.parse(result.rooms)).then(function (rooms) {
                    user.rooms = rooms;
                    for (const i in result) {
                        socket.context[i] = result[i];
                    }
                    rooms.forEach(function (room) {
                        user.joinRoom(room.name);
                    });
                    cb(successData({
                        name: user.name,
                        avatar: user.avatar,
                    }));
                });

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

    io.on('join', (ctx, data) => {
        console.log('join event fired', data)
    });
    io.on('simple', function (ctx, data) {
        console.log("sim", arguments);
    });

    io.on('god-message', function (ctx, data) {
        console.log("god-message", ctx, data);
        if (crSocket)
            crSocket.emit("message", {
                data
            });
    });
    let crSocket;
    io.on('cr-register', function (ctx, data) {
        console.log("cr-register");
        crSocket = ctx.socket;
    });
    io.on('cr-message', function (ctx, data) {
        console.log("cr-message", ctx, data);
        crSocket = ctx.socket;
        crSocket.broadcast("cr-message", data);
    });
}
module.exports = {
    init
}
