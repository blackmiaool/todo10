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
const fs = require('fs');
const randtoken = require('rand-token');
// const roomMap = {};
// const fs = require('fs');
const config = require("../config.js");
const uaParser = require('ua-parser-js');

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
            const id = await db.create(JSON.stringify(data), socket.context.name, owner);
            const list = await db.getList(socket.context.name);
            cb({
                id,
                list
            });
        });
        socket.on('getList', async(data, cb) => {
            if (!socket.context.name) {
                cb(errorMap[13]);
                return;
            }
            const list = await db.getList(socket.context.name);
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
        socket.on('login', async(data, cb) => {
            //            console.log(data.name, socket.handshake.headers['user-agent'])
            let name;
            let avatar;
            let email = data.email;
            const mode = data.mode;
            if (!data.mode) {
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
            console.log('try', {
                email,
                password: data.password,
                mode
            })
            db.login({
                email,
                password: data.password,
                mode
            }).then(function (result) {
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
                    password: result.password,
                    email,
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
                        }, cb)
                    }
                }
            });
        })
    });
}
module.exports = {
    init
}
