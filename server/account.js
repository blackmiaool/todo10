import { registerCheck } from "../common/check.js";
import { errorMap, getError, successData } from "../common/error.js";
const randtoken = require("rand-token");
const uaParser = require("ua-parser-js");
const config = require("../config.js");
const fs = require("fs");
const db = require("./db.js");
const userMap = {};
class User {
    constructor(info) {
        Object.assign(
            this,
            {
                clients: []
            },
            info
        );
    }
    connectClient(socket) {
        this.clients.push(socket);
    }
    disconnectClient(socket) {
        socket.emit("logged-out", function() {});
        const index = this.clients.indexOf(socket);
        if (index > -1) {
            this.clients.splice(index, 1);
        } else {
            console.warn(
                `it's weird that we can't find the index of the disconnected client`
            );
        }
        if (!this.clients.length) {
            //remove the user then
            delete userMap[socket.context.user.id];
        }
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
        const checkResult = registerCheck(
            "server",
            "login",
            data.name,
            data.email,
            data.password
        );
        if (checkResult) {
            checkResult.code = 1;
            cb(checkResult);
            return;
        }
    } else {
        const { getInfo } = require(`../port/login/${data.mode}/server.js`);
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
    })
        .then(result => {
            if (this.context.uid) {
                //already logged in
                const user = User.getUser(this.context.uid);
                user.disconnectClient(this);
            }
            let user;
            user = User.addUser(result);

            const ua = uaParser(this.handshake.headers["user-agent"]);
            this.context.os = ua.os.name;
            user.connectClient(this);
            this.context.uid = user.id;
            this.context.user = user;
            cb(
                successData({
                    name: user.name,
                    avatar: user.avatar,
                    password: result.password,
                    email,
                    uid: user.id
                })
            );
        })
        .catch(function(result) {
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
                    console.log("register", name, email, mode, avatar);
                    register(
                        {
                            name,
                            email,
                            mode,
                            avatar
                        },
                        function(result) {
                            if (result.code === 0) {
                                doLogin(data, cb);
                            } else {
                                cb(result);
                            }
                        }
                    );
                }
            }
        });
}
async function register({ name, email, password, avatar, mode }, cb) {
    if (!mode) {
        //just check data input by user
        const checkResult = registerCheck(
            "server",
            "register",
            name,
            email,
            password
        );

        if (checkResult) {
            checkResult.code = 1;
            cb(checkResult);
            return;
        }
    }
    let avatarSrc;
    let buf;
    if (!mode) {
        avatarSrc = `//${config.domain}:${
            config.serverPort
        }/avatar/${name}.png`; //TODO must use config file to determine domain
        buf = Buffer.from(avatar.slice(22), "base64");
    } else {
        avatarSrc = avatar;
        password = randtoken.generate(32);
    }

    const result = await db.register(name, email, password, avatarSrc);
    if (!result) {
        if (!mode) {
            fs.writeFileSync(`${__dirname}/public/avatar/${name}.png`, buf);
        }
        cb(
            successData({
                password,
                name,
                avatar,
                email
            })
        );
    } else {
        if (result.code === "SQLITE_CONSTRAINT") {
            cb({
                key: "name",
                msg: "Username exists"
            });
        } else {
            cb({
                key: "name",
                msg: "Fail to write into db"
            });
        }
    }
}
// setInterval(() => {
//     console.log(Object.keys(userMap));
// }, 1000);
module.exports = {
    doLogin,
    register,
    userMap
};
