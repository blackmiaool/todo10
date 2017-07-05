<template>
    <div class="top-page-wrap todo-page">
        <TodoCreator @create="onCreate" :mode="mode" :editing="editing"></TodoCreator>
        <TodoList :list="list" @select="onSelect"></TodoList>
        <TodoInfo></TodoInfo>
    </div>
</template>

<script>
import $ from "jquery";
import socket from "../io";

import eventHub from 'eventHub';
import settings from 'settings';
import datepicker from 'vue-date';
import TodoCreator from 'components/TodoCreator';
import TodoList from 'components/TodoList';
import TodoInfo from 'components/TodoInfo';

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
        });
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
                    assignee: "abc",
                    deadline: 1499257423548,
                    priority: "normal",
                    selectedTags: ["编辑器", "活动", "app-rn"],
                    id: 1234,
                },
                {
                    title: "测试2",
                    assignee: "lll",
                    deadline: 1499257423548,
                    priority: "warn",
                    selectedTags: ["活动", "app-rn"],
                    id: 1231,
                },
                {
                    title: "测试3",
                    assignee: "sdfs",
                    deadline: 1499257563708,
                    priority: "danger",
                    selectedTags: ["app-rn", "小程序"],
                    id: 456,
                }
            ],
            today: (new Date()).format("yyyy-MM-dd")
        }
    },
    watch: {

    },
    methods: {
        onCreate(item) {
            console.log(item);
        },
        onSelect(item) {
            this.mode = "View";
            this.editing = item;
            console.log('item', item);
        }
    },
    components: {
        TodoCreator,
        TodoList,
        TodoInfo
    }

}

</script>
