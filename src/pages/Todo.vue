<template>
    <div class="top-page-wrap todo-page">
        <TodoPanel page="todo" v-if="userName" ref="todoPanel" @create="onCreate" :editing="editing" @save="onSave" @fork="onFork" @newOne="onNew" @transfer="onTransfer" @shareAsImage="onShareAsImage" @selectUser="onTodoPanelSelectUser"></TodoPanel>
        <TodoList :list="list" ref="list" @select="onSelect" @finish="onFinish" @restore="onRestore" @destroy="onDestroy" @generateReport="onGenerateReport" @refresh="onRefresh" @new="onNew"></TodoList>
        <Modal v-if="showingModal" @cancel="onModalCancel">
            <UserSelector v-if="modalMap.userSelector" @select="onSelectUser">
    
            </UserSelector>
            <ReportViewer v-if="modalMap.reportViewer" :list="reportList">
            </ReportViewer>
            <ImageShare v-if="modalMap.imageShare" :src="sharingImage"></ImageShare>
        </Modal>
    </div>
</template>

<script>
import store from 'store';

import $ from 'jquery';
window.$ = $;
import TodoPanel from 'components/TodoPanel';
import TodoList from 'components/TodoList';
import Modal from 'components/Modal';
import UserSelector from 'components/UserSelector';
import ReportViewer from 'components/ReportViewer';
import ImageShare from 'components/ImageShare';
import socket from "../io";
import domtoimage from 'dom-to-image';
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
        list: () => store.state.list
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
            showingModal: false,
            modalMap: {},
            today: (new Date()).format("yyyy-MM-dd"),
            reportList: [],
            sharingImage: '',
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
            socket.emit("getList", {}, (list) => {
                store.commit('setTodoList', list);
                if (this.$route.params.id) {
                    this.view(this.$route.params.id);
                    this.$refs.list.select(list.find(li => li.id == this.$route.params.id));
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
                store.commit('setTodoList', list);
            });
        },
        onFinish(item) {
            item = JSON.parse(JSON.stringify(item));
            item.status = 'done';
            socket.emit("finish", item.id, ({ data: { list } }) => {
                store.commit('setTodoList', list);
            });
        },
        onDestroy(item) {
            if (!confirm("Unwatch it?")) {
                return;
            }

            socket.emit('unwatch', { id: item.id }, ({ data: { list } }) => {
                store.commit('setTodoList', list);
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
                store.commit('setTodoList', list);
                this.$refs.list.select(list.find(li => li.id === id));
            });
        },
        onSave(item) {
            const id = item.id;
            socket.emit("edit", item, ({ data: { list } }) => {
                store.commit('setTodoList', list);
                this.view(id);
            });
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
        onModalCancel() {
            this.hideModal();
            this.$emit('modalCancel');
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
                this.$once("modalCancel", (uid) => {
                    reject(uid);
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
                    store.commit('setTodoList', list);
                });
            }).catch(() => {

            });
        },
        onTodoPanelSelectUser() {
            console.log('showUserSelector')
            this.selectUser().then((uid) => {
                this.$refs.todoPanel.selectUser(uid);
            }).catch(() => {

            });
        },
        onSelectUser(uid) {
            this.$emit("select-user", uid);
            this.hideModal();
        },
        onGenerateReport(list) {
            this.showModal('reportViewer');
            this.reportList = list;
        },
        onRefresh() {
            store.commit('setTodoList', []);
            socket.emit("getList", {}, (result) => {
                store.commit('setTodoList', result);
            });
        },
        shareImage(src) {
            this.showModal('imageShare');
            this.sharingImage = src;
        },
        onShareAsImage(id) {
            console.log('onShareAsImage', id)
            const $target = $(`#${id}`);
            $target.addClass('screenshotting');
            $(".todo-page .detail-panel").css('width', '600px');

            function clean() {
                $target.removeClass('screenshotting');
                $(".todo-page .detail-panel").css('width', '');
            }
            setTimeout(() => {
                domtoimage.toPng($target[0])
                    .then((dataUrl) => {
                        var img = new Image();
                        img.src = dataUrl;
                        this.shareImage(dataUrl)
                        // document.body.appendChild(img);
                        clean();
                    })
                    .catch(function (error) {
                        clean();
                        alert('failed');
                        console.error('oops, something went wrong!', error);
                    });
            }, 200);

        }
    },
    components: {
        TodoPanel,
        TodoList,
        UserSelector,
        Modal,
        ReportViewer,
        ImageShare
    }

}

</script>
