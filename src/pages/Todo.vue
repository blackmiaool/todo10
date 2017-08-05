<template>
    <div class="top-page-wrap todo-page">
        <TodoPanel page="todo" v-if="userName" ref="todoPanel" @create="onCreate" :editing="editing" @save="onSave" @fork="onFork" @newOne="onNew" @transfer="onTransfer"></TodoPanel>
        <TodoList :list="list" ref="list" @select="onSelect" @finish="onFinish" @restore="onRestore" @destroy="onDestroy"></TodoList>
        <Modal v-if="showingModal">
            <UserSelector v-if="modalMap.userSelector" @select="onSelectUser">
    
            </UserSelector>
        </Modal>
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
import Modal from 'components/Modal';
import UserSelector from 'components/UserSelector';
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
        store.commit("setCommonTags", ['活动', 'app-rn', 'rnrender', '酷玩', '品味']);
    },
    data() {
        return {
            mode: "Create",
            editing: undefined,
            initialized: false,
            isSelectingUser: false,
            list: [],
            showingModal: false,
            modalMap: {},
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
            this.$refs.todoPanel.setMode("Create");
            socket.emit("getList", {}, (result) => {
                store.commit('setTodoList', result);
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
        hideModal() {
            this.showingModal = false;
            this.modalMap = {};
        },
        showModal(name) {
            this.showingModal = true;
            this.modalMap[name] = true;
        },
        selectUser() {
            this.showModal('userSelector');
            return new Promise((resolve, reject) => {
                this.$on("select-user", (uid) => {
                    resolve(uid);
                });
                this.$on("close-user-selector", (uid) => {
                    resolve(uid);
                });
            });
        },
        onTransfer(id) {
            this.selectUser().then((uid) => {
                console.log('transfer', id, 'to', uid);

                socket.emit("transfer", {
                    id,
                    uid,
                }, ({ data: { list } }) => {
                    console.warn('list', list);
                    store.commit('setTodoList', list);
                    this.list = list;
                });
            }).catch(() => {

            });
        },
        onSelectUser(uid) {
            this.$emit("select-user", uid);
            this.hideModal();
        }
    },
    components: {
        TodoPanel,
        TodoList,
        UserSelector,
        Modal
    }

}

</script>
