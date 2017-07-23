<template>
    <div class="top-page-wrap view-page">
        <TodoPanel page="view" ref="todoPanel" :editing="editing" @fork="onFork" @login="goLogin" @watch="watch" @unwatch='unwatch'></TodoPanel>
    </div>
</template>

<script>
import $ from "jquery";
import socket from "../io";

import eventHub from 'eventHub';
import settings from 'settings';
import datepicker from 'vue-date';
import TodoPanel from 'components/TodoPanel';
import TodoList from 'components/TodoList';
import TodoInfo from 'components/TodoInfo';
import store from 'store';

function e() {
    console.log(e)
    return this.d;
}
export default {
    name: 'Todo',
    created() {

    },
    computed: {
        userName: () => store.state.user && store.state.user.name,
    },
    mounted() {
        this.init();
        store.commit("setCommonTags", ['编辑器', '活动', 'app-rn', '小程序', 'rnrender'])
    },
    data() {
        return {
            editing: undefined,
        }
    },
    watch: {
        '$route': 'init',
    },
    methods: {
        watch() {
            socket.emit('watch', { id: this.$route.query.id }, () => {
                window.router.push({
                    name: 'Todo',
                    params: {
                        id: this.$route.query.id,
                    }
                });
            });
        },
        unwatch() {
            socket.emit('unwatch', { id: this.$route.query.id }, ({ data: { info } }) => {
                this.$refs.todoPanel.view(info);
            });
        },
        goLogin() {
            window.router.push({
                name: 'Login',
                params: {
                    target: "View",
                    params: JSON.parse(JSON.stringify(this.$route.query))
                }
            });
        },
        init() {
            if (this.$route.name !== 'View') {
                return;
            }
            const id = this.$route.query.id;
            if (!id) {
                alert("need id param");
                return;
            }
            if (!store.state.logged) {
                store.dispatch('login').catch(() => {
                    //ignore
                });
            }
            socket.emit("getTodo", { id }, ({ data: { info } }) => {
                this.$refs.todoPanel.view(info);
            });
        },
        onFork(item) {
            item = JSON.parse(JSON.stringify(item));
            delete item.id;
            this.$refs.todoPanel.setMode("Create");
            this.$refs.list.clear();
            console.log(item)
            setTimeout(() => {
                this.$refs.todoPanel.set(item);
            });
        },
    },
    components: {
        TodoPanel,
        TodoList,
        TodoInfo
    }

}

</script>
