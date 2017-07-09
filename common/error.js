const map = {
    "0": {
        msg: "ok"
    },
    "1": {
        msg: "DB error",
    },

    "2": { //join room
        msg: "Room doesn't exist"
    },
    "3": {
        msg: "Room name too long"
    },
    "5": { //join room
        msg: "Already in this room",
    },
    "6": {
        msg: "Wrong password or wrong nickname"
    },
    "7": {
        msg: "Room name exists",
    },
    "8": {
        msg: 'Invalid type',
    },
    "9": {
        msg: 'Username too long'
    },
    "10": {
        msg: "Username should be longer than 1"
    },
    "11": {
        msg: "Invalid password length"
    },
    "12": {
        msg: "Invalid password length"
    },
    "13": {
        msg: "Not logged in",
    },
    "14": {
        msg: "Invalid content"
    },
    "15": {
        msg: "Message too long"
    },
    "16": {
        msg: "Img src too long"
    },
    "17": {
        msg: "Priority needed"
    },
    "18": {
        msg: "Requestor needed"
    },

}
for (const i in map) {
    map[i].code = parseInt(i);
}

function getError(index, extra) {
    let ret;
    if (parseInt(index) === index) {
        ret = JSON.parse(JSON.stringify(map[index]));
    }
    if (typeof extra === "object") {
        for (const i in extra) {
            ret[i] = extra[i];
        }
    }

    return ret;
}

function successData(data) {
    const ret = JSON.parse(JSON.stringify(map[0]));
    ret.data = data;
    return ret;
}
module.exports = {
    errorMap: map,
    getError,
    successData
}
