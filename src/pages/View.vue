<template>
    <div class="top-page-wrap view-page">
        <TodoPanel page="view" ref="todoPanel" :editing="editing" @fork="onFork"></TodoPanel>
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
    methods: {
        init() {
            this.initialized = true;
            // vm.$refs.todoPanel.set(vm.list[0]);

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
            socket.emit("getTodo", { id }, ({ data: { item } }) => {
                this.$refs.todoPanel.view(item);
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
