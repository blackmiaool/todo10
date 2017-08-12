import {
    loadLocal,
} from './io';

let config = loadLocal('config');

if (!config) {
    config = {
        showNotification: false,
    };
}
if (config.showNotification) {
    window.Notification.requestPermission(() => {});
}
export default {
    config,
};
