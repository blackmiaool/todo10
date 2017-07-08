<template>
    <div class="top-page-wrap todo-page">
        <TodoPanel v-if="userName" ref="creator" @create="onCreate" :editing="editing" @save="onSave" @fork="onFork"></TodoPanel>
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

export default {
    name: 'Todo',
    created() {
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            console.log('socket', socket.context.logged)
            if (!socket.context.logged) {
                router.replace("/login")
                return;
            }
            setTimeout(() => {
                if (!vm.$refs.creator) {
                    return;
                }
                vm.$refs.creator.set(vm.list[0]);
                vm.$refs.creator.setMode("Create");
            }, 100);
        });
    },
    computed: {
        userName: () => store.state.user && store.state.user.name
    },
    mounted() {


    },
    data() {
        return {
            mode: "Create",
            editing: undefined,
            list: [
                {
                    title: "测试1",
                    description: "测试1的描述",
                    creator: 'a',
                    assignee: "blackmiaool",
                    deadline: 1499257423548,
                    priority: "normal",
                    selectedTags: ["编辑器", "活动", "app-rn"],
                    id: 1234,
                    status: 'pending',
                },
                {
                    title: "测试2",
                    description: "测试2的描述",
                    creator: 'blackmiaool',
                    assignee: "blackmiaool",
                    deadline: 1499257423548,
                    priority: "warn",
                    selectedTags: ["活动", "app-rn"],
                    id: 1231,
                    status: 'pending',
                },
                {
                    title: "测试3",
                    description: "测试3的描述",
                    creator: 'blackmiaool2',
                    assignee: "blackmiaool",
                    deadline: 1499257563708,
                    priority: "danger",
                    selectedTags: ["app-rn", "小程序"],
                    id: 456,
                    status: 'done',
                }
            ],

            today: (new Date()).format("yyyy-MM-dd")
        }
    },
    watch: {

    },

    methods: {
        onCreate(item) {
            item = JSON.parse(JSON.stringify(item));
            item.id = parseInt(Math.random() * 1000);
            this.list.push(item);
        },
        onSave(item) {
            console.log('onSave', item);
            this.list.some((v, i) => {
                if (v.id === item.id) {
                    Object.assign(v, item);
                    this.$refs.creator.view(v);
                    return true;
                }

            });

        },
        onFork(item) {
            item = JSON.parse(JSON.stringify(item));
            item.id = parseInt(Math.random() * 1000);
            this.list.push(item);

            setTimeout(() => {
                this.$refs.list.edit(item, false);    // body
                setTimeout(() => {
                    this.$refs.creator.setMode("Edit");
                });
            });

        },
        onSelect(item) {
            this.$refs.creator.view(item);
            this.editing = item;

            console.log('onSelect item', item);
        },
    },
    components: {
        TodoPanel,
        TodoList,
        TodoInfo
    }

}

</script>
