import socket from "../io";
// import store from 'store';
module.exports = {
    methods: {
        onWatch() {
            socket.emit('watch', {
                id: this.selecting
            }, () => {
                this.init();
            });
        },
        unWatch() {
            socket.emit('unwatch', {
                id: this.selecting
            }, () => {
                this.init();
            });
        },
    }
}
