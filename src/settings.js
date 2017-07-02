import {
    loadLocal
} from "./io";

let config = loadLocal("config");

if (!config) {
    config = {
        showNotification: false
    }
}
if (config.showNotification) {
    window.Notification.requestPermission(function (permission) {});
}
export default {
    config
}
