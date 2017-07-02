import {
    //    errorMap,
    getError,
    //    successData
} from "./error.js";

function registerCheck(mode, name, password, password2) {
    if (typeof name !== "string") {
        return getError(8, {
            key: "name",
        });
    }

    if (name.length > 32) {
        return getError(9, {
            key: "name",
            msg: `Username too long(exceeds ${name.length - 32}) chars`
        });
    }
    if (name.length < 2) {
        return getError(10, {
            key: "name"
        });
    }

    if (typeof password !== "string") {
        return getError(8, {
            key: "password",
        });
    }
    if (mode === "server") {
        if (encodeURIComponent(password).length !== 32) {
            return getError(11, {
                key: "password",
            });
        }
    }

    if (password2 && password2 !== password) {
        return getError(12, {
            key: "password2",
        });
    }
    return false;
}
module.exports = {
    registerCheck
}
