const db = require('./db.js');

const mapCurrent = {};
const mapAll = {};

// db.getList(true).then((list) => {
//     list.forEach((li) => {
//         if (!li.attachments) {
//             return;
//         }
//         li.attachments = li.attachments.map((att) => {
//             if (att.match(/files\/\//)) {
//                 console.log(li.id, att);
//             }
//             return att.replace(/files\/\//, `files\/${li.id}\/`);
//         });
//         console.log(li.attachments);
//         edit(li.id, li);
//     });
// });
db.getList(true).then((list) => {
    list.forEach((li) => {
        mapAll[li.id] = li;
        mapCurrent[li.id] = li;
    });
});
db.getList(false).then((list) => {
    list.forEach((li) => {
        mapAll[li.id] = li;
    });
});

function getTodo(id) {
    return mapAll[id];
}

function getList(uid, filter) {
    console.log(uid, filter);
    const ret = [];
    if (filter && Object.keys(filter).length) {
        let project;
        let tag;
        let uid;
        if (filter.project) {
            project = filter.project * 1;
        }
        if (filter.tag) {
            tag = filter.tag * 1;
        }
        if (filter.uid) {
            uid = filter.uid;
        }
        for (const id in mapAll) {
            const item = mapAll[id];
            if (project) {
                if (!item.projects || item.projects.indexOf(project) === -1) {
                    continue;
                }
            }
            if (uid) {
                if (item.owner != uid || item.status !== 'pending') {
                    continue;
                }
            }
            if (tag) {
                if (!item.tags || item.tags.indexOf(tag) === -1) {
                    continue;
                }
            }
            ret.push(item);

        }
    } else {
        for (const id in mapCurrent) {
            const item = mapCurrent[id];
            if (item.watchers[uid]) {
                ret.push(item);
            }
        }
    }
    return ret;
}

async function edit(id, info) {
    const active = Boolean(Object.keys(info.watchers).length);
    await db.edit(id, JSON.stringify(info), active);

    if (!active) {
        delete mapCurrent[id];
    } else {
        mapCurrent[id] = info;
    }
    mapAll[id] = info;
}

async function create(info) {
    const id = await db.create(JSON.stringify(info));
    info.id = id;
    syncInfo(id, info);
    return id;
}

function syncInfo(id, info) {
    mapAll[id] = info;
    mapCurrent[id] = info;
}
async function watch(id, uid) {
    const info = getTodo(id);
    info.watchers[uid] = true;
    await edit(id, info);
}
async function unwatch(id, uid) {
    const info = getTodo(id);
    delete info.watchers[uid];
    await edit(id, info);
    return info;
}
async function transfer(id, uid) {
    const info = getTodo(id);
    info.owner = uid;
    info.watchers[uid] = true;
    await edit(id, info);
}

function filter(func, range = 'current') {
    if (range === 'current') {
        range = mapCurrent;
    } else if (range = 'all') {
        range = mapAll;
    } else {
        console.warn('unknown range', range);
        range = {}
    }
    const ret = [];
    for (const i in range) {
        const item = range[i];
        if (func(item)) {
            ret.push(item);
        }
    }
    return ret;
}

module.exports = {
    getList,
    create,
    edit,
    getTodo,
    watch,
    unwatch,
    transfer,
    mapCurrent,
    mapAll,
    filter,
}
