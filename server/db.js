const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.cached.Database("db");
const config = require("../config.js");
const mongoose = require("mongoose");
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
// import {
//     errorMap,
//     getError,
//     successData
// } from "../common/error.js";

//create table
mongoose.connect("mongodb://localhost/todo10", {
    useNewUrlParser: true
});
var mdb = mongoose.connection;
mdb.on('error', console.error.bind(console, 'connection error:'));
mdb.once('open', function () {

    console.log("we're connected!")
});
const toObjectTransform = {
    transform: (doc, ret) => {
        delete ret.__v;
        delete ret._id;
    },
};


var CounterSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    cnt: Number
});
const counter = mongoose.model('counter', CounterSchema);
// (new counter({
//     name: 'project',
//     cnt: 30
// })).save();
// (new counter({
//     name: 'tag',
//     cnt: 58
// })).save();
// (new counter({
//     name: 'user',
//     cnt: 77
// })).save();
// (new counter({
//     name: 'todo',
//     cnt: 653
// })).save();

function pre(name, key = 'id') {
    return async function () {
        var doc = this;
        const {
            cnt
        } = await counter.findOneAndUpdate({
            name
        }, {
            $inc: {
                cnt: 1
            }
        });
        if (doc[key]) {
            return;
        }
        doc[key] = cnt;
    }
}


var messageSchema = new mongoose.Schema({
    id: {
        type: Number,
        sparse: true,
    },
    uid: Number,
    createTime: Date,
    content: String,
}, {
    toObject: toObjectTransform
});


// mySchema.set('toJSON', {
//     virtuals: true,
//     transform: (doc, ret, options) => {
//         delete ret.__v;
//         ret.id = ret._id.toString();
//         delete ret._id;
//     },
// });
const tagSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
    },
    name: String,
}, {
    toObject: toObjectTransform
});
tagSchema.pre('save', pre('tag'));
var todoSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
    },
    active: Boolean,
    title: String,
    description: String,
    deadline: Date,
    priority: String,
    projects: [Number],
    tags: [Number],
    requestor: Number,
    owner: Number,
    watchers: [Number],
    attachments: [{
        url: String,
        type: {
            type: String
        }
    }],
    status: String,
    history: [{
        source: String, //JSON
        target: String, //JSON
        key: String,
        uid: Number,
        time: Date,
    }],
    partners: [Number]
}, {
    toObject: toObjectTransform
});
todoSchema.pre('save', pre('todo'));
var projectSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
    },
    name: String,
    tags: [Number]
}, {
    toObject: toObjectTransform
});
projectSchema.pre('save', pre('project'));
var userSchema = new mongoose.Schema({
    uid: {
        type: Number,
        unique: true,
    },
    name: String,
    email: String,
    password: String,
    avatar: String,
    active: Boolean
}, {
    toObject: toObjectTransform
});
userSchema.pre('save', pre('user', 'uid'));

const todoModel = mongoose.model('todo', todoSchema);
const projectModel = mongoose.model('project', projectSchema);
const userModel = mongoose.model('user', userSchema);
const messageModel = mongoose.model('message', messageSchema);
const tagModel = mongoose.model('tag', tagSchema);

// messageModel.find().then((list) => {
//     console.log('list', list)
// });
// messageModel.find(function (err, result) {
//     if (err) return console.error(err);
//     console.log(result);
// })
// var fluffy = new Kitten({
//     name: 'fluffy'
// });

// fluffy.save(function (err, fluffy) {
//     if (err) return console.error(err);
//     console.log(1, fluffy);
// });

// setTimeout(() => {
//     Kitten.find(function (err, kittens) {
//         if (err) return console.error(err);
//         console.log(kittens);
//     })
// }, 500);
db.serialize(function () {
    db.run(
        `CREATE TABLE tag (
        id INTEGER PRIMARY KEY,
        Name TEXT,
        Project INTEGER,     
        FOREIGN KEY (Project) REFERENCES project(id) 
        );
    `,
        function () {}
    );
    db.run(
        `CREATE TABLE project (
        id INTEGER PRIMARY KEY,
        Name TEXT, 
        Data TEXT
        );
    `,
        function () {}
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
        function () {}
    );

    db.run(
        `CREATE TABLE todo (
        id INTEGER PRIMARY KEY,
        Data TEXT,
        Active BOOLEAN
        );
    `,
        function () {}
    );
    db.run(
        `CREATE TABLE message (
        id TEXT PRIMARY KEY,
        uid INTEGER,
        Data TEXT,
        FOREIGN KEY (uid) REFERENCES user(id)
        );
    `,
        function () {}
    );
    // db.all(
    //     `SELECT id,uid,Data FROM message;`, {},
    //     function (e, result) {
    //         if (e) {
    //             console.log(e);
    //         } else {
    //             for (let i = 0; i < result.length; i++) {
    //                 const v = result[i];
    //                 const data = JSON.parse(v.Data);
    //                 var a = new messageModel({
    //                     id: v.id,
    //                     uid: v.uid,
    //                     createTime: data.createTime,
    //                     content: data.content,
    //                 });
    //                 a.save();
    //             };
    //         }
    //     });

    // var todoSchema = new mongoose.Schema({
    //     id: {
    //         type: Number,
    //         unique: true,
    //     },
    //     active: Boolean,
    //     title: String,
    //     description: String,
    //     deadline: Date,
    //     priority: String,
    //     projects: [Number],
    //     tags: [Number],
    //     requestor: Number,
    //     watchers: [Number],
    //     history: [{
    //         source: String, //JSON
    //         target: String, //JSON
    //         key: String,
    //         uid: Number,
    //         time: Date,
    //     }],
    //     partners: [Number]
    // });
    // db.all(
    //     `SELECT Name,id,Email,Password,Avatar,Active FROM user;`, {},
    //     function (e, result) {
    //         if (e) {
    //             console.log(e);
    //         } else {
    //             for (let i = 0; i < result.length; i++) {
    //                 const v = result[i];
    //                 var a = new userModel({
    //                     uid: v.id,
    //                     name: v.Name,
    //                     email: v.Email,
    //                     password: v.Password,
    //                     avatar: v.Avatar,
    //                     active: !Boolean(v.Active)
    //                 });
    //                 a.save();
    //             }
    //         }
    //     });

    function getTags(projectId) {
        return new Promise((resolve) => {
            db.all(
                `SELECT id,Name FROM tag WHERE Project=$proj;`, {
                    $proj: projectId
                },
                async function (e, result) {
                    resolve(result)
                });
        });

    }
    // transferProject();

    function transferProject() {
        db.all(
            `SELECT id,Name FROM project;`, {},
            async function (e, result) {
                if (e) {
                    console.log(e);
                } else {
                    for (let i = 0; i < result.length; i++) {
                        const v = result[i];
                        var a = new projectModel({
                            id: v.id,
                            name: v.Name,
                            tags: (await getTags(v.id)).map((tag) => {
                                return tag.id
                            })
                        });
                        await a.save();
                    }
                }
            });
    }

    function transferUser() {
        db.all(
            `SELECT Name,id,Email,Password,Avatar FROM user;`, {},
            async function (e, result) {
                if (e) {
                    console.log(e);
                } else {
                    for (let i = 0; i < result.length; i++) {
                        const v = result[i];
                        var a = new userModel({
                            uid: v.id,
                            name: v.Name,
                            email: v.Email,
                            password: v.Password,
                            avatar: v.Avatar,
                            active: true
                        });
                        await a.save();
                    }
                }
            });
    }

    function transferMessage() {
        db.all(
            `SELECT id,uid,Data FROM message;`, {},
            async function (e, result) {
                if (e) {
                    console.log(e);
                } else {
                    for (let i = 0; i < result.length; i++) {
                        const v = result[i];
                        const data = JSON.parse(v.Data);
                        var a = new messageModel({
                            id: v.id,
                            uid: v.uid,
                            createTime: data.createTime,
                            content: data.content,
                        });
                        await a.save();
                    };
                }
            });
    }
    // transferTag();

    function transferTag() {
        db.all(
            `SELECT id,Name FROM tag;`, {},
            async function (e, result) {
                if (e) {
                    console.log(e);
                } else {
                    for (let i = 0; i < result.length; i++) {
                        const v = result[i];
                        var a = new tagModel({
                            id: v.id,
                            name: v.Name
                        });
                        await a.save();
                    }
                }
            });
    }
    // transferTodo()

    function transferTodo() {
        db.all(
            `SELECT Active,id,Data FROM todo;`, {},
            async function (e, result) {
                if (e) {
                    console.log(e);
                } else {
                    for (let i = 0; i < result.length; i++) {
                        const v = result[i];

                        if (v.Data) {
                            v.data = JSON.parse(v.Data);
                        } else {
                            v.data = {};
                        }
                        Object.assign(v, v.data);

                        let watchers = Object.keys(v.watchers || {}).map(a => a * 1);
                        watchers = watchers.filter((w) => {
                            return !isNaN(w)
                        });

                        let attachments = (v.attachments || []).map((a) => {
                            const url = a.replace(
                                /(http:)?\/\/blackmiaool\.jios\.org(:\d+)?/g,
                                "");
                            let type = 'file';
                            if (url.match(/\.jpg|\.jpeg|\.png|\.gif/)) {
                                type = 'image';
                            } else if (url.match(/\.js|\.go|\.html|\.css|\.java|\.c|\.ts/)) {
                                type = 'code'
                            }
                            return {
                                type,
                                url
                            }
                        }); //todo
                        const msg = new todoModel({
                            ...v,
                            active: v.Active,
                            id: v.id,
                            watchers: watchers,
                            partners: Object.keys(v.partners || {}).map(a => a * 1),
                            attachments,
                            history: (v.history || []).map((his) => ({
                                ...his,
                                source: JSON.stringify(his.source),
                                target: JSON.stringify(his.target),
                            }))
                        });
                        delete v.Data;
                        delete v.data;
                        await msg.save();
                    };
                }
                // console.log(result)
            }
        );
    }
    // transferMessage();
    // transferProject();
    // transferTag();
    // transferTodo();
    // transferUser();
});

function deleteMessage($id) {
    return messageModel.deleteOne({
        id: $id
    });
}

function getNanoSecTime() {
    return Date.now() + (process.hrtime()[1] % 1000).toString();
}


function getMessageList($uid) {
    return messageModel.find({
        uid: $uid
    }).then((list) => {
        return list.map((v) => {
            v = v.toObject();
            const data = {
                createTime: v.createTime,
                content: v.content,
            }
            v.data = data;
            return v;
        });
    });
}

function addMessage($uid, $data) {
    const msg = new messageModel({
        id: getNanoSecTime(),
        uid: $uid,
        createTime: $data.createTime,
        content: $data.content
    });
    return msg.save();
}

function getUserList() {
    return userModel.find();
}

function getTodo(data) {
    data = JSON.parse(data);
    data.watchers = Object.keys(data.watchers || {}).map(a => a * 1);
    data.partners = Object.keys(data.partners || {}).map(a => a * 1);
    (data.history || []).forEach((h) => {
        h.source = JSON.stringify(h.source);
        h.target = JSON.stringify(h.target)
    });
    return data;
}

async function edit($id, $data, $active) {
    await todoModel.updateOne({
        id: $id
    }, {
        active: $active,
        ...getTodo($data)
    });
    return false;
}

async function create($data) {
    const todo = new todoModel({
        ...getTodo($data),
        active: true,
    });
    await todo.save();
    return todo.id;
}

async function getList($active) {
    const list = await todoModel.find({
        active: $active
    })
    return list.map((v) => {
        v = v.toObject();
        const watchers = {};
        v.watchers.forEach((uid) => {
            watchers[uid] = true;
        });
        v.deadline = (new Date(v.deadline)).getTime();
        const partners = {};
        v.partners.forEach((uid) => {
            partners[uid] = true;
        });
        v.watchers = watchers;
        v.partners = partners;
        v.history.forEach((item) => {
            if (item.source) {
                item.source = JSON.parse(item.source);
            }
            if (item.target) {
                item.target = JSON.parse(item.target);
            }
        });

        return v;
    });
}


function login({
    email: $email,
    password: $password,
    mode
}) {
    return userModel.findOne({
        email: $email
    }).then((user) => {
        if (!user) {
            throw -1;
        }
        user = user.toObject();
        user.id = user.uid;
        delete user.uid;
        if (user.password === $password || mode) {
            return user;
        } else {
            throw -2;
        }
    });
}

async function getAvatar($name) {
    const user = await userModel.findOne({
        name: $name
    })
    return user.avatar;
}
async function register($name, $email, $password, $avatar, $source) {
    const user = new userModel({
        name: $name,
        email: $email,
        password: $password,
        avatar: $avatar
    });
    await user.save();
    return false;
}

function addProject({
    name: $name
}) {
    const proj = new projectModel({
        name: $name,
        tags: []
    });
    return proj.save();
}

async function addTag({
    project,
    tag
}) {
    const tagO = new tagModel({
        name: tag
    });

    await tagO.save();

    await projectModel.findOneAndUpdate({
        id: project,
    }, {
        $push: {
            tags: tagO.id
        }
    });
    return false;
}

async function getProjects() {
    let projects = await projectModel.find();
    const tags = await tagModel.find()

    const tagMap = {};
    tags.forEach(tag => {
        tagMap[tag.id] = tag;
    });
    projects = projects.map(project => {
        project = project.toObject();
        project.tags = project.tags.map((id) => {
            return tagMap[id]
        });
        return project;
    });
    return projects;
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
