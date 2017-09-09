import socket from "../io";
// import store from 'store';
module.exports = {
    data() {
        return {
            selecting: undefined
        }
    },
    methods: {
        created() {
            this.$set(this, 'selecting', undefined);
        },
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
        view(id) {
            const target = this.list.find(li => li.id * 1 === id * 1);
            if (target) {
                this.$refs.todoPanel && this.$refs.todoPanel.view(target);
                this.selecting = target.id;
            }
        },
        onSelect(item) {
            if (item.id == this.selecting) {
                this.selecting = undefined;
                return;
            }
            this.view(item.id);
        },
        inList(id) {
            return this.list.find((item) => item.id * 1 === id * 1);
        }
    }
}
