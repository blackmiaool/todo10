<template>
    <div class="top-page-wrap todo-page">
        <TodoPanel page="list" v-if="userName" ref="todoPanel" :editing="editing" @fork="onFork"></TodoPanel>
        <TodoList :list="list" ref="list" @select="onSelect"></TodoList>
        <TodoInfo></TodoInfo>
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
    name: 'List',
    created() {
        setTimeout(() => {

        }, 100);
    },
    beforeRouteEnter(to, from, next) {
        if (!store.state.logged) {
            store.dispatch("login").then((result) => {
                next(vm => {
                });
            }).catch(() => {
                next("/login");
            });
        } else {
            next(vm => {
            });
        }

    },
    computed: {
        userName: () => store.state.user && store.state.user.name,
    },
    mounted() {
        this.init();
        store.commit("setCommonTags", ['编辑器', '活动', 'app-rn', '小程序', 'rnrender', '酷玩', '品味', 'todolist']);
    },
    data() {
        return {
            editing: undefined,
            initialized: false,
            list: [

            ],

            today: (new Date()).format("yyyy-MM-dd")
        }
    },
    watch: {
        '$route': 'init'
    },
    methods: {
        init() {
            this.initialized = true;
            // vm.$refs.todoPanel.set(vm.list[0]);
            // this.$refs.todoPanel.setMode("Create");
            socket.emit("getList", {}, (result) => {
                this.list = result;
                if (this.$route.params.id) {
                    this.view(this.$route.params.id);
                }
            });
        },
        view(id) {
            const target = this.list.find(li => li.id * 1 === id * 1);
            if (target) {
                this.$refs.todoPanel.view(target);
                this.editing = target;
                // this.view(this.$route.params.id);
            }
        },
        onFork(item) {
            item = JSON.parse(JSON.stringify(item));
            delete item.id;
            this.$refs.todoPanel.setMode("Create");
            this.$refs.list.clear();
            setTimeout(() => {
                this.$refs.todoPanel.set(item);
            });
        },
        onSelect(item) {
            this.$refs.todoPanel.view(item);
            this.editing = item;

        },

    },
    components: {
        TodoPanel,
        TodoList,
        TodoInfo
    }

}

</script>
