const name = "米家内部";
module.exports = {
    cb: function (cb) {
        function onMessage(message) {
            const sessid = message.data;
            window.removeEventListener('message', onMessage);
            handle.close();
            cb(sessid);
        }
        window.addEventListener('message', onMessage);
        const handle = window.open("http://support.io.mi.srv/miot_editor/tools/login.html");
    },
    title: name + "登录",
    icon: require("./logo.png"),
}
