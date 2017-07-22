const db = require('./db.js');

const mapCurrent = {};
const mapAll = {};

// db.getList(true).then((list) => {
//     list.forEach((li) => {
//         li.priority = ({
//             'verbose': 3,
//             'normal': 2,
//             'warn': 1,
//             'danger': 0,
//         })[li.priority];
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

function getTodo({
    id
}) {
    return mapAll[id];
}

function getList(uid) {
    const ret = [];
    for (const id in mapCurrent) {
        const item = mapCurrent[id];
        if (item.watchers[uid]) {
            ret.push(item);
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
    mapAll[id] = info;
    mapCurrent[id] = info;
    return id;
}
module.exports = {
    getList,
    create,
    edit,
    getTodo
}
