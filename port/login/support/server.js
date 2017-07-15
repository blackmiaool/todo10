const request = require("request");
const config = require("../../../config.js");

const avatar = `//${config.domain}:${config.serverPort}/port/support.png`;

function getInfo(sessid) {
    return new Promise(function (resolve, reject) {
        request({
            method: "POST",
            url: "http://support.io.mi.srv/index/if_user_info",
            headers: {
                Cookie: sessid
            },
            json: true
        }, function (error, response, body) {
            if (error) {
                reject(error);
            } else {
                if (body.code) {
                    reject(body);
                } else {
                    resolve({
                        name: body.result.user,
                        email: body.result.user + "@xiaomi.com",
                        avatar
                    });
                }
            }
        });
    })
};
module.exports = {
    getInfo
}
