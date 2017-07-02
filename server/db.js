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
        Name VARCHAT(32),
        Password TEXT,
        Avatar TEXT,
        Rooms TEXT default '[]',
        PRIMARY KEY (Name)
        );
    `, function (e) {});

    db.run(`CREATE TABLE room (
        Name VARCHAT(32),
        Admin VARCHAT(32),
        Bulletin TEXT default '',
        Avatar TEXT,       
        PRIMARY KEY (Name)
        FOREIGN KEY (Admin) REFERENCES user(Name)
        );
    `, function (e) {});
    db.run(`CREATE TABLE message (        
        id INTEGER PRIMARY KEY,
        Name VARCHAT(32),        
        Room VARCHAT(32),   
        Time DATETIME,
        Type TEXT,
        Content LONGTEXT,     
        FOREIGN KEY (Name) REFERENCES user(Name)
        );
    `, function (e) {});

    db.run(`INSERT INTO room (Name,Bulletin,Avatar) VALUES ($name,$bulletin,$avatar);`, {
        $name: config.firstRoom.name,
        $bulletin: config.firstRoom.bulletin,
        $avatar: config.firstRoom.avatar
    }, function (e) {

    });
    //    db.run(`DELETE FROM user WHERE Name=$r;`, {
    //        $r: 'robot10'
    //    }, function (e) {
    //        console.log(e);
    //    });

    //    db.all(`SELECT * FROM message ORDER BY id DESC LIMIT 1;
    //            `, function (e, data) {
    //        console.log(e, data)
    //    });
});
//db.close();
async function login($name, $password) {
    let result;
    result = await new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.get(`SELECT Name as name,Password as password,Avatar as avatar,Rooms as rooms FROM user WHERE Name=$name;`, {
                $name,
            }, function (e, result) {
                if (e) {
                    console.log(e);
                    reject(e);
                } else {
                    if (!result) {
                        reject(true);
                    } else if (result.password === $password) {
                        resolve(result);
                    } else {
                        reject(true);
                    }
                }
            });
        });
    });
    return result;
}
let avatarCache = {};

async function getAvatar($name) {
    const cache = avatarCache[$name];
    if (cache) {
        if (typeof cache === "object") //promise{
        {
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
async function getRoomsHistoryLength($room) {
    let promise1 = new Promise(function (resolve, reject) {
        db.all(`SELECT id FROM message WHERE Room = $room ORDER BY id DESC `, {
            $room
        }, function (e, data) {
            if (e) {
                console.log(e);
                reject(e);
            } else {
                if (data) {
                    resolve(data.length);
                } else {
                    resolve(0);
                }
            }
        });
    });
    return await promise1;
};
async function getRoomsHistory($room, $id = Infinity, $num) {
    let promise = new Promise(function (resolve, reject) {
        db.all(`SELECT Content as content,Time as time,Type as type,Name as name,id FROM message WHERE Room = $room And id < $id ORDER BY id DESC LIMIT 0,$num;
                    `, {
                        $room,
                        $id,
                        $num,
                    }, function (e, data) {
            if (e) {
                console.log(e);
                reject(e);
            } else {
                data.forEach(function (v, i, a) {
                    if (v.type === "image" || v.type === "code" || v.type === "file") {
                        try {
                            v.content = JSON.parse(v.content);
                        } catch (e) {
                            v.content = {};
                        }
                    }
                });
                resolve(data || []);
            }
        });
    }).then(function (msgs) {
        const sum = msgs.length;
        if (sum) {
            let promise = Promise.resolve()
            msgs.forEach(function (msg, i) {
                const p = new Promise(function (resolve) {
                    getAvatar(msg.name).then(function (avatar) {
                        msg.avatar = avatar;
                        resolve(msgs);
                    });
                });
                promise = promise.then(function () {
                    return p
                });
            });
            return promise;
        } else {
            return Promise.resolve([]);
        }
    });

    return await promise;
}
async function getRoomsInfo(rooms) {
    rooms = JSON.parse(JSON.stringify(rooms)) || [];
    let promise = Promise.resolve();
    rooms.forEach(function (room, i, a) {
        promise = promise.then(function () {
            return new Promise(function (resolve, reject) {
                db.get(`SELECT Name as name,Admin as admin,Avatar as avatar,Bulletin as bulletin FROM room WHERE Name=$name;`, {
                    $name: room
                }, function (e, result) {
                    if (e) {
                        console.log(e);
                        reject(e);
                    } else {
                        getRoomsHistory(room, undefined, 10).then(function (msgs) {
                            msgs.forEach(function (msg) {
                                msg.time = (new Date(msg.time)).getTime();
                            });

                            result.messages = msgs.reverse();
                            a[i] = result;
                        }).then(function () {
                            resolve();
                        });
                    }
                });
            })
        });
    });
    await promise;

    return rooms;
}
async function joinRoom($name, $roomName) {
    console.log('$roomName', $roomName)
    let result = await new Promise(function (resolve, reject) {
        const p1 = new Promise(function (resolve, reject) {
            db.get(`SELECT Admin as admin FROM room WHERE Name=$roomName;`, {
                $roomName,
            }, function (e, result) {
                if (e) {
                    console.log(e);
                    reject(e);
                } else {
                    if (result) {
                        resolve();
                    } else {
                        reject(errorMap[2]);
                    }
                }
            });
        }).then(function () {
            return new Promise(function (resolve, reject) {
                db.get(`SELECT Rooms as rooms FROM user WHERE Name=$name;`, {
                    $name,
                }, function (e, result) {
                    if (e) {
                        console.log(e);
                        reject(e);
                    } else {
                        resolve(JSON.parse(result.rooms));
                    }
                });
            });
        }).then(function ($rooms) {
            return new Promise(function (resolve, reject) {
                if ($rooms.indexOf($roomName) !== -1) {
                    reject(errorMap[5]);
                    return;
                }
                $rooms.push($roomName);
                db.run(`UPDATE user SET Rooms=$rooms WHERE Name=$name;`, {
                    $name,
                    $rooms: JSON.stringify($rooms),
                }, function (e) {
                    if (e) {
                        console.log(e);
                        reject(e);
                    } else {
                        resolve();
                    }
                });
            });
        }).then(function () {
            resolve(false);
        }).catch(function (e) {
            console.log("e", e);
            reject(e);
        });
    });

    return result;
}
async function createRoom($name, $roomName) {
    let result = await new Promise(function (resolve, reject) {
        let $rooms;
        const p1 = new Promise(function (resolve, reject) {
            db.run(`INSERT INTO room (Name,Bulletin,Avatar,Admin) VALUES ($roomName,$bulletin,$avatar,$name);`, {
                $roomName,
                $bulletin: `Hello`,
                $avatar: config.roomDefaultAvatar,
                $name,
            }, function (e) {
                if (e) {
                    console.log(e);
                    reject(e);
                } else {
                    resolve();
                }
            });
        });
        p1.then(function () {
            return new Promise(function (resolve, reject) {
                db.get(`SELECT Rooms as rooms FROM user WHERE Name=$name;`, {
                    $name,
                }, function (e, result) {
                    $rooms = JSON.parse(result.rooms);
                    if (e) {
                        console.log(e);
                        reject(e);
                    } else {
                        resolve();
                    }
                });
            });
        }).then(function () {
            return new Promise(function (resolve, reject) {
                $rooms.push($roomName);
                db.run(`UPDATE user SET Rooms=$rooms WHERE Name=$name;`, {
                    $name,
                    $rooms: JSON.stringify($rooms),
                }, function (e) {
                    if (e) {
                        console.log(e);
                        reject(e);
                    } else {
                        resolve();
                    }
                });
            });
        }).then(function () {
            resolve(false);
        }).catch(function (e) {
            reject(e);
        });
    });

    return result;
}

async function register($name, $password, $avatar) {
    let result;
    avatarCache = {};
    result = await new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.run(`INSERT INTO user (Name,Password,Rooms,Avatar) VALUES ($name,$password,$rooms,$avatar);`, {
                $name,
                $password,
                $rooms: `["god"]`,
                $avatar,
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
async function saveMessage($name, $room, date, $type, $content) {
    let result;
    const $time = date.getFullYear() + '-' +
        ('00' + (date.getMonth() + 1)).slice(-2) + '-' +
        ('00' + date.getDate()).slice(-2) + ' ' +
        ('00' + date.getHours()).slice(-2) + ':' +
        ('00' + date.getMinutes()).slice(-2) + ':' +
        ('00' + date.getSeconds()).slice(-2);
    result = await new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.run(`INSERT INTO message (Name,Room,Time,Type,Content) VALUES ($name,$room,$time,$type,$content);`, {
                $name,
                $room,
                $time,
                $type,
                $content
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
async function setRoomInfo($name, info) {
    let params = {
        Bulletin: '$bulletin',
        Admin: '$admin',
    };
    for (const i in params) {
        if (!info[i]) {
            delete params[i];
        }
    }
    let paramsStr = [];
    for (const i in params) {
        paramsStr.push([i, params[i]]);
    }
    paramsStr = paramsStr.map(function ([name, as]) {
        return `${name} = ${as}`;
    }).join(",");
    const result = await new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.run(`UPDATE room SET ${paramsStr} WHERE Name = $name;`, Object.assign({
                $name,
            }, {
                $bulletin: info.Bulletin,
                $admin: info.Admin
            }), function (e) {
                if (e) {
                    resolve(e);
                } else {
                    resolve(false);
                }
            });
        });
    });
    return result;
}
export {
    register,
    getRoomsInfo,
    login,
    createRoom,
    joinRoom,
    saveMessage,
    getRoomsHistory,
    setRoomInfo
}
