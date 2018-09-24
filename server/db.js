const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.cached.Database("db");
const config = require("../config.js");
// import {
//     errorMap,
//     getError,
//     successData
// } from "../common/error.js";

//create table
db.serialize(function() {
    db.run(
        `CREATE TABLE tag (
        id INTEGER PRIMARY KEY,
        Name TEXT,
        Project INTEGER,     
        FOREIGN KEY (Project) REFERENCES project(id) 
        );
    `,
        function() {}
    );
    db.run(
        `CREATE TABLE project (
        id INTEGER PRIMARY KEY,
        Name TEXT, 
        Data TEXT
        );
    `,
        function() {}
    );
    db.run(
        `CREATE TABLE user (
        id INTEGER PRIMARY KEY,
        Name VARCHAT(32),
        Email TEXT,
        Password TEXT,
        Avatar TEXT,
        Source TEXT
        );
    `,
        function() {}
    );

    db.run(
        `CREATE TABLE todo (
        id INTEGER PRIMARY KEY,
        Data TEXT,
        Active BOOLEAN
        );
    `,
        function() {}
    );
    db.run(
        `CREATE TABLE message (
        id TEXT PRIMARY KEY,
        uid INTEGER,
        Data TEXT,
        FOREIGN KEY (uid) REFERENCES user(id)
        );
    `,
        function() {}
    );
});

function deleteMessage($id) {
    return new Promise(function(resolve, reject) {
        db.serialize(function() {
            db.run(
                `DELETE FROM message WHERE id=$id`,
                {
                    $id
                },
                function(e) {
                    if (e) {
                        console.log(e);
                        reject(e);
                    } else {
                        resolve();
                    }
                }
            );
        });
    });
}

function getNanoSecTime() {
    return Date.now() + (process.hrtime()[1] % 1000).toString();
}
function getMessageList($uid) {
    return new Promise(function(resolve, reject) {
        db.serialize(function() {
            db.all(
                `SELECT Data as data,id FROM message WHERE uid=$uid;`,
                {
                    $uid
                },
                function(e, result) {
                    if (e) {
                        console.log(e);
                        reject(e);
                    } else {
                        if (!result) {
                            reject(true);
                        } else {
                            result.forEach(v => {
                                v.data = JSON.parse(v.data);
                            });
                            resolve(result);
                        }
                    }
                }
            );
        });
    });
}
function addMessage($uid, $data) {
    return new Promise(function(resolve, reject) {
        db.serialize(function() {
            db.run(
                `INSERT INTO message (Data,uid,id) VALUES ($data,$uid,$id);`,
                {
                    $id: getNanoSecTime(),
                    $uid,
                    $data: JSON.stringify($data)
                },
                function(e) {
                    if (e) {
                        console.log(e);
                        reject(e);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    });
}
function getUserList() {
    return new Promise(function(resolve, reject) {
        db.serialize(function() {
            db.all(
                `SELECT id as uid,Name as name,Email as email,Avatar as avatar FROM user;`,
                {},
                function(e, result) {
                    if (e) {
                        console.log(e);
                        reject(e);
                    } else {
                        if (!result) {
                            reject(true);
                        } else {
                            resolve(result);
                        }
                    }
                }
            );
        });
    });
}

function edit($id, $data, $active) {
    return new Promise(function(resolve) {
        db.serialize(function() {
            db.run(
                `UPDATE todo SET Data=$data,Active=$active  WHERE id=$id;`,
                {
                    $id,
                    $data,
                    $active
                },
                function(e) {
                    if (e) {
                        console.log(e);
                        resolve(e);
                    } else {
                        resolve(false);
                    }
                }
            );
        });
    });
}

function create($data) {
    return new Promise(function(resolve, reject) {
        db.serialize(function() {
            db.run(
                `INSERT INTO todo (Data,Active) VALUES ($data,$active);`,
                {
                    $data,
                    $active: true
                },
                function(e) {
                    if (e) {
                        console.log(e);
                        reject(e);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    });
}

function getList($active) {
    return new Promise(function(resolve, reject) {
        db.serialize(function() {
            db.all(
                `SELECT Data as data,id FROM todo WHERE Active=$active;`,
                {
                    $active
                },
                function(e, result) {
                    if (e) {
                        console.log(e);
                        reject(e);
                    } else {
                        if (!result) {
                            reject(true);
                        } else {
                            result.forEach(v => {
                                v.data = v.data.replace(
                                    /(http:)?\/\/blackmiaool\.jios\.org/,
                                    "//" + config.domain
                                );
                                const parsed = JSON.parse(v.data);
                                delete parsed.id;
                                Object.assign(v, parsed);
                                delete v.data;
                                if (!v.partners) {
                                    v.partners = {};
                                }
                            });
                            resolve(result);
                        }
                    }
                }
            );
        });
    });
}

function login({ email: $email, password: $password, mode }) {
    return new Promise(function(resolve, reject) {
        db.serialize(function() {
            db.get(
                `SELECT id,Name as name,Email as email,Password as password,Avatar as avatar FROM user WHERE Email=$email;`,
                {
                    $email
                },
                function(e, result) {
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
                }
            );
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

    const promise = new Promise(function(resolve, reject) {
        db.get(
            `SELECT Avatar as avatar FROM user WHERE Name = $name`,
            {
                $name
            },
            function(e, data) {
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
            }
        );
    });
    avatarCache[$name] = promise;
    return await promise;
}

function register($name, $email, $password, $avatar, $source) {
    avatarCache = {};
    return new Promise(function(resolve) {
        db.serialize(function() {
            db.run(
                `INSERT INTO user (Name,Email,Password,Avatar,Source) VALUES ($name,$email,$password,$avatar,$source);`,
                {
                    $name,
                    $password,
                    $avatar,
                    $email,
                    $source
                },
                function(e) {
                    if (e) {
                        console.log(e);
                        resolve(e);
                    } else {
                        resolve(false);
                    }
                }
            );
        });
    });
}

function addProject({ name: $name }) {
    return new Promise(function(resolve, reject) {
        db.get(
            `SELECT id FROM project WHERE Name=$name;`,
            {
                $name
            },
            function(e, result) {
                if (e) {
                    console.log(e);
                    reject(e);
                } else {
                    if (!result) {
                        db.serialize(function() {
                            db.run(
                                `INSERT INTO project (Name,Data) VALUES ($name,$data);`,
                                {
                                    $name,
                                    $data: JSON.stringify({})
                                },
                                function(e) {
                                    if (e) {
                                        console.log(e);
                                        reject(e);
                                    } else {
                                        resolve(false);
                                    }
                                }
                            );
                        });
                    } else {
                        console.log(result, "duplicated");
                        reject("duplicated");
                    }
                }
            }
        );
    });
}

function addTag({ project, tag }) {
    return new Promise(resolve => {
        db.run(
            `INSERT INTO tag (Name,Project) VALUES ($name,$project);`,
            {
                $name: tag,
                $project: project
            },
            function(e) {
                if (e) {
                    console.log(e);
                    resolve(e);
                } else {
                    resolve(false);
                }
            }
        );
    });
}

function getProjects() {
    let projects;
    let tags;
    const p1 = new Promise((resolve, reject) => {
        db.all(
            `SELECT Data as data,Name as name,id FROM project;`,
            {},
            function(e, result) {
                if (e) {
                    console.log(e);
                    reject(e);
                } else {
                    if (!result) {
                        reject(true);
                    }

                    projects = result;
                    resolve(result);
                }
            }
        );
    });
    const p2 = new Promise((resolve, reject) => {
        db.all(
            `SELECT Project as project,Name as name,id FROM tag;`,
            {},
            function(e, result) {
                if (e) {
                    console.log(e);
                    reject(e);
                } else {
                    if (!result) {
                        reject(true);
                    }
                    tags = result;
                    resolve(result);
                }
            }
        );
    });
    return p1.then(() => p2).then(
        () =>
            new Promise(resolve => {
                const tagMap = {};
                tags.forEach(tag => {
                    if (!tagMap[tag.project]) {
                        tagMap[tag.project] = [];
                    }
                    tagMap[tag.project].push(tag);
                });
                projects.forEach(project => {
                    project.data = JSON.parse(project.data);
                    project.tags = tagMap[project.id] || [];
                });
                resolve(projects);
            })
    );
}
export {
    register,
    login,
    getList,
    create,
    edit,
    getAvatar,
    getUserList,
    addProject,
    getProjects,
    addTag,
    addMessage,
    getMessageList,
    deleteMessage
};
