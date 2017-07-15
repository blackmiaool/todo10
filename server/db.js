const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.cached.Database('db');
const config = require("../config.js");
import {
    errorMap,
    getError,
    successData
} from "../common/error.js";

db.serialize(function () {
    db.run(`CREATE TABLE user (
        id INTEGER PRIMARY KEY,
        Name VARCHAT(32),
        Email TEXT,
        Password TEXT,
        Avatar TEXT,
        Source TEXT
        );
    `, function (e) {});

    db.run(`CREATE TABLE todo (
        id INTEGER PRIMARY KEY,
        Data TEXT,
        Requestor TEXT,
        Owner TEXT,      
        FOREIGN KEY (Requestor) REFERENCES user(id)
        FOREIGN KEY (Owner) REFERENCES user(id)
        );
    `, function (e) {});
});

async function edit($id, $data, $requestor, $owner) {
    let result;
    result = await new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.run(`UPDATE todo SET Data=$data,Requestor=$requestor,Owner=$owner WHERE id=$id;`, {
                $id,
                $data,
                $requestor,
                $owner,
            }, function (e) {
                if (e) {
                    console.log(e);
                    resolve(e);
                } else {
                    resolve(false);
                }
            });
        });
    });
    return result;
}

function create($data, $requestor, $owner) {
    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.run(`INSERT INTO todo (Data,Requestor,Owner) VALUES ($data,$requestor,$owner);`, {
                $data,
                $requestor,
                $owner,
            }, function (e) {
                if (e) {
                    console.log(e);
                    resolve(e);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    });
}

function getList($name) {
    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.all(`SELECT Data as data,Requestor as requestor,Owner as owner,id as id FROM todo WHERE Requestor=$name OR Owner=$name ;`, {
                $name,
            }, function (e, result) {
                if (e) {
                    console.log(e);
                    reject(e);
                } else {
                    result.forEach((v) => {
                        const parsed = JSON.parse(v.data);
                        delete parsed.id;
                        Object.assign(v, parsed);
                        delete v.data;
                    });
                    if (!result) {
                        reject(true);
                    } else {
                        resolve(result);
                    }
                }
            });
        });
    });
}

function login({
    email: $email,
    password: $password,
    mode
}) {
    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.get(`SELECT Name as name,Email as email,Password as password,Avatar as avatar FROM user WHERE Email=$email;`, {
                $email,
            }, function (e, result) {
                console.log('result', result);
                if (e) {
                    console.log(e);
                    reject(e);
                } else {
                    if (!result) {
                        reject(-1); //no user
                    } else if (result.password === $password || mode) {
                        resolve(result);
                    } else {
                        reject(-2); //wrong pwd
                    }
                }
            });
        });
    });
}
let avatarCache = {};

async function getAvatar($name) {
    const cache = avatarCache[$name];
    if (cache) {
        if (typeof cache === "object") {
            return cache;
        } else {
            return await cache;
        }
    }

    const promise = new Promise(function (resolve, reject) {
        db.get(`SELECT Avatar as avatar FROM user WHERE Name = $name`, {
            $name
        }, function (e, data) {
            if (e) {
                console.log(e);
                reject(e);
            } else {
                if (data) {
                    avatarCache[$name] = data.avatar;
                    resolve(data.avatar);
                } else {
                    resolve("");
                }
            }
        });
    });
    avatarCache[$name] = promise;
    return await promise;
}

function register($name, $email, $password, $avatar, $source) {
    avatarCache = {};
    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.run(`INSERT INTO user (Name,Email,Password,Avatar,Source) VALUES ($name,$email,$password,$avatar,$source);`, {
                $name,
                $password,
                $avatar,
                $email,
                $source
            }, function (e) {
                if (e) {
                    console.log(e);
                    resolve(e);
                } else {
                    resolve(false);
                }
            });
        });
    });
}

export {
    register,
    login,
    getList,
    create,
    edit,
    getAvatar
}
