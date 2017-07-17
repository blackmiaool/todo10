<template>
    <div class="top-page-wrap todo-page">
        <TodoPanel page="todo" v-if="userName" ref="todoPanel" @create="onCreate" :editing="editing" @save="onSave" @fork="onFork" @newOne="onNew"></TodoPanel>
        <TodoList :list="list" ref="list" @select="onSelect" @finish="onFinish" @restore="onRestore" @destroy="onDestroy"></TodoList>
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
    name: 'Todo',
    created() {
        setTimeout(() => {

        }, 100);
    },
    beforeRouteEnter(to, from, next) {
        if (!socket.context.logged) {
            return next("/login");
        }
        next(vm => {
            setTimeout(() => {
                vm.init.call(vm);
            }, 100);
        });
    },
    computed: {
        userName: () => store.state.user && store.state.user.name,
        a: function () {
            if (this.b) {
                return this.c;
            } else {
                return e.call(this);
            }
        }
    },
    mounted() {
        this.init();
        store.commit("setCommonTags", ['编辑器', '活动', 'app-rn', '小程序', 'rnrender', '酷玩', '品味', 'todolist']);
    },
    data() {
        return {
            b: true,
            c: 2,
            d: 3,
            mode: "Create",
            editing: undefined,
            initialized: false,
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
        init() {
            if (this.initialized) {
                return;
            }
            if (!this.$refs.todoPanel) {
                return;
            }
            this.initialized = true;
            // vm.$refs.todoPanel.set(vm.list[0]);
            this.$refs.todoPanel.setMode("Create");
            socket.emit("getList", {}, (result) => {
                this.list = result;
            });
        },
        onRestore(item) {
            item = JSON.parse(JSON.stringify(item));
            item.status = 'pending';
            socket.emit("edit", item, ({ data: { list } }) => {
                this.list = list;
            });
        },
        onFinish(item) {
            item = JSON.parse(JSON.stringify(item));
            item.status = 'done';
            socket.emit("edit", item, ({ data: { list } }) => {
                this.list = list;
            });
        },
        onDestroy(item) {
            if (!confirm("Delete it?"))
                return;
            item = JSON.parse(JSON.stringify(item));
            delete item.watchers[store.state.user.uid];
            socket.emit("edit", item, ({ data: { list } }) => {
                this.list = list;
            });
        },
        onCreate(item) {
            item = JSON.parse(JSON.stringify(item));
            item.status = 'pending';
            socket.emit("create", item, ({ code, msg, data: { id, list } }) => {
                if (code) {
                    alert(msg);
                    return;
                }
                this.list = list;
                this.$refs.list.edit(list.find(li => li.id === id));
            });
        },
        onSave(item) {
            console.log('onSave', item);
            const id = item.id;
            socket.emit("edit", item, ({ data: { list } }) => {
                this.list = list;

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
            delete item.id;
            this.$refs.todoPanel.setMode("Create");
            this.$refs.list.clear();
            console.log(item)
            setTimeout(() => {
                this.$refs.todoPanel.set(item);
            });
        },
        onSelect(item) {
            this.$refs.todoPanel.view(item);
            this.editing = item;

            console.log('onSelect item', item);
        },
        onNew() {
            this.$refs.todoPanel.setMode('Create');
            this.$refs.list.clear();
            setTimeout(() => {
                this.$refs.todoPanel.set({});
            })
        },
    },
    components: {
        TodoPanel,
        TodoList,
        TodoInfo
    }

}

</script>
