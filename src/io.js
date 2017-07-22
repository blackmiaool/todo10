const config = require("../config.js");
const io = require('socket.io-client')
const socket = io(`:${config.serverPort}`);
socket.context = {
    logged: false
};

export default socket;

function saveLocal(key, value) {
    const type = typeof value;
    if (typeof value === "object" && value) {
        value = JSON.stringify(value);
    }
    let item2save = {
        type,
        value
    };
    item2save = JSON.stringify(item2save);
    window.localStorage.setItem(`god-${key}`, item2save);
}

function loadLocal(key) {
    let item = window.localStorage.getItem(`god-${key}`);
    if (!item) {
        return;
    }
    item = JSON.parse(item);
    let {
        value,
        type
    } = item;

    if (type === "object") {
        value = JSON.parse(value);
    }

    return value;
}
export {
    saveLocal,
    loadLocal
};
