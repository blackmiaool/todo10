<template>
    <div class="top-page-wrap todo-page">
        <TodoPanel v-if="userName" ref="todoPanel" @create="onCreate" :editing="editing" @save="onSave" @fork="onFork"></TodoPanel>
        <TodoList :list="list" ref="list" @select="onSelect" @finish="onFinish"></TodoList>
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
        if (!socket.context.logged) {
            return next("/login");
        }
        next(vm => {
            setTimeout(() => {
                if (!vm.$refs.todoPanel) {
                    return;
                }
                // vm.$refs.todoPanel.set(vm.list[0]);
                vm.$refs.todoPanel.setMode("Create");
                socket.emit("getList", {}, (result) => {
                    console.log('result', result)
                    vm.list = result;
                });
            }, 100);
        });
    },
    computed: {
        userName: () => store.state.user && store.state.user.name
    },
    mounted() {
        store.commit("setCommonTags", ['编辑器', '活动', 'app-rn', '小程序'])

    },
    data() {
        return {
            mode: "Create",
            editing: undefined,
            list: [
                {
                    title: "测试1",
                    description: "测试1的描述",
                    requestor: 'a',
                    owner: "blackmiaool",
                    deadline: 1499257423548,
                    priority: "normal",
                    selectedTags: ["编辑器", "活动", "app-rn"],
                    id: 1234,
                    status: 'pending',
                },
                {
                    title: "测试2",
                    description: "测试2的描述",
                    requestor: 'blackmiaool',
                    owner: "blackmiaool",
                    deadline: 1499257423548,
                    priority: "warn",
                    selectedTags: ["活动", "app-rn"],
                    id: 1231,
                    status: 'pending',
                },
                {
                    title: "测试3",
                    description: "测试3的描述",
                    requestor: 'blackmiaool2',
                    owner: "blackmiaool",
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
        onFinish(item) {
            item = JSON.parse(JSON.stringify(item));
            item.status = 'done';
            socket.emit("edit", item, (result) => {
                this.list = result;
                console.log('result', result)
            });
        },
        onCreate(item) {
            item = JSON.parse(JSON.stringify(item));
            item.status = 'pending';
            socket.emit("create", item, (result) => {
                this.list = result;
                console.log('result', result)
            });
        },
        onSave(item) {
            console.log('onSave', item);
            const id = item.id;
            socket.emit("edit", item, (result) => {
                this.list = result;
                console.log('result', result)
                const target = this.list.find(li => li.id === id);
                console.log('target', id, target)
                if (target) {
                    this.$refs.todoPanel.view(target);
                    this.editing = target;
                }
            });


            // this.editing = item;
            // this.list.some((v, i) => {
            //     if (v.id === item.id) {
            //         Object.assign(v, item);
            //         this.$refs.todoPanel.view(v);
            //         return true;
            //     }

            // });

        },
        onFork(item) {
            item = JSON.parse(JSON.stringify(item));
            item.id = parseInt(Math.random() * 1000);
            this.list.push(item);

            setTimeout(() => {
                this.$refs.list.edit(item, false);    // body
                setTimeout(() => {
                    this.$refs.todoPanel.setMode("Edit");
                });
            });

        },
        onSelect(item) {
            this.$refs.todoPanel.view(item);
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
