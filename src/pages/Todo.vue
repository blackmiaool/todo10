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
        if (!store.state.logged) {
            return next("/login");
        }
        next(vm => {
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
            mode: "Create",
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
            console.log('init', this.$route.params.id)
            this.initialized = true;
            // vm.$refs.todoPanel.set(vm.list[0]);
            this.$refs.todoPanel.setMode("Create");
            socket.emit("getList", {}, (result) => {
                this.list = result;
                if (this.$route.params.id) {
                    this.view(this.$route.params.id);
                }
            });
        },
        view(id) {
            console.log('view', id, this.list)
            const target = this.list.find(li => li.id * 1 === id * 1);
            console.log(target)
            if (target) {
                this.$refs.todoPanel.view(target);
                this.editing = target;
                // this.view(this.$route.params.id);
            }
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
            if (!confirm("Unwatch it?"))
                return;
            socket.emit('unwatch', { id: item.id }, () => {
                this.list.some((v, i) => {
                    if (v.id === item.id) {
                        this.list.splice(i, 1);
                        return true;
                    }
                });
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
                this.$refs.list.select(list.find(li => li.id === id));
            });
        },
        onSave(item) {
            console.log('onSave', item);
            const id = item.id;
            socket.emit("edit", item, ({ data: { list } }) => {
                this.list = list;
                this.view(id);
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
