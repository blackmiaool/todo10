<template>
    <div class="top-page-wrap todo-page">
        <TodoPanel page="todo" v-if="userName" ref="todoPanel" @create="onCreate" :editing="editing" @save="onSave" @fork="onFork" @newOne="onNew" @transfer="onTransfer" @shareAsImage="onShareAsImage"></TodoPanel>
        <TodoList :list="list" ref="list" @select="onSelect" @finish="onFinish" @restore="onRestore" @destroy="onDestroy" @generateReport="onGenerateReport" @refresh="onRefresh" @new="onNew" @deleteAll="deleteAll" @toggleMessageBox="toggleMessageBox" :refreshing="refreshing"></TodoList>
        <MessageBox :active="showingMessageBox" @close="showingMessageBox=!showingMessageBox" />
        <Modal v-if="showingModal" @cancel="onModalCancel">
            <UserSelector v-if="showingModal==='userSelector'">

            </UserSelector>
            <ReportViewer v-if="showingModal==='reportViewer'" :list="reportList">
            </ReportViewer>
            <ImageShare v-if="showingModal==='imageShare'" :src="sharingImage"></ImageShare>
        </Modal>
    </div>
</template>

<script>
import store from "store";

import $ from "jquery";
window.$ = $;
import TodoPanel from "components/TodoPanel";
import TodoList from "components/TodoList";
import Modal from "components/Modal";
import UserSelector from "components/UserSelector";
import ReportViewer from "components/ReportViewer";
import ImageShare from "components/ImageShare";
import socket from "../io";
import domtoimage from "dom-to-image";
import MessageBox from "components/MessageBox";
import { mapState, mapMutations, mapActions } from "vuex";
import eventHub from "../eventHub";

export default {
    name: "Todo",
    created() {
        setTimeout(() => {}, 100);
    },
    beforeRouteEnter(to, from, next) {
        if (!store.state.logged) {
            store
                .dispatch("login")
                .then(result => {
                    next(vm => {});
                })
                .catch(() => {
                    next("/login");
                });
        } else {
            next(vm => {});
        }
    },
    computed: {
        userName: () => store.state.user && store.state.user.name,
        list: () => store.state.list,
        ...mapState(["showingModal"])
    },
    mounted() {
        this.$refs.todoPanel.setMode("Create");
        this.init();
        store.commit("setCommonTags", [
            "活动",
            "app-rn",
            "rnrender",
            "酷玩",
            "品味"
        ]);
        eventHub.$on("select-user", uid => {
            this.setModal(null);
        });
    },
    data() {
        return {
            mode: "Create",
            editing: undefined,
            initialized: false,
            today: new Date().format("yyyy-MM-dd"),
            reportList: [],
            sharingImage: "",
            refreshing: false,
            showingMessageBox: false
        };
    },
    watch: {
        $route: "init"
    },
    methods: {
        ...mapMutations(["setModal"]),
        ...mapActions(["selectUser"]),
        init() {
            this.initialized = true;
            // vm.$refs.todoPanel.set(vm.list[0]);

            socket.emit("getList", {}, list => {
                list = list.data;
                store.commit("setTodoList", list);
                if (this.$route.params.id) {
                    this.view(this.$route.params.id);
                    this.$refs.list.select(
                        list.find(li => li.id == this.$route.params.id)
                    );
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
            socket.emit("restore", item.id, ({ data: { list } }) => {
                store.commit("setTodoList", list);
            });
        },
        onFinish(item) {
            item = JSON.parse(JSON.stringify(item));
            item.status = "done";
            socket.emit("finish", item.id, ({ data: { list } }) => {
                store.commit("setTodoList", list);
            });
        },
        onDestroy(item) {
            if (!confirm("Unwatch it?")) {
                return;
            }

            socket.emit("unwatch", { id: item.id }, ({ data: { list } }) => {
                store.commit("setTodoList", list);
            });
        },
        onCreate(item) {
            item = JSON.parse(JSON.stringify(item));
            item.status = "pending";
            socket.emit("create", item, ({ code, msg, data: { id, list } }) => {
                if (code) {
                    alert(msg);
                    return;
                }
                store.commit("setTodoList", list);
                this.$refs.list.select(list.find(li => li.id === id));
            });
        },
        onSave(item) {
            const id = item.id;
            socket.emit("edit", item, ({ data: { list } }) => {
                store.commit("setTodoList", list);
                this.view(id);
            });
        },
        onFork(item) {
            item = JSON.parse(JSON.stringify(item));
            delete item.id;
            this.$refs.list.clear();
            this.$refs.todoPanel.createNew(item);
        },
        onSelect(item) {
            this.$refs.todoPanel.view(item);
            this.editing = item;
        },
        onNew() {
            this.$refs.list.clear();
            this.$refs.todoPanel.createNew();
        },
        onModalCancel() {
            this.hideModal();
            eventHub.$emit("modal-cancel");
            this.$emit("modalCancel");
        },
        hideModal() {
            this.setModal(null);
        },
        showModal(name) {
            this.setModal(name);
        },
        onTransfer(id) {
            this.selectUser()
                .then(uid => {
                    const userName = store.getters.uid2name(uid);
                    if (!confirm(`是否确认将任务移交给${userName}`)) {
                        return;
                    }
                    console.log("transfer", id, "to", uid);

                    socket.emit(
                        "transfer",
                        {
                            id,
                            uid
                        },
                        ({ data: { list } }) => {
                            store.commit("setTodoList", list);
                        }
                    );
                })
                .catch(() => {});
        },
        onGenerateReport(list) {
            this.showModal("reportViewer");
            this.reportList = list;
        },
        onRefresh() {
            this.refreshing = true;
            // store.commit('setTodoList', []);
            socket.emit("getList", {}, result => {
                this.refreshing = false;
                store.commit("setTodoList", result.data);
            });
        },
        shareImage(src) {
            this.showModal("imageShare");
            this.sharingImage = src;
        },
        onShareAsImage(id) {
            console.log("onShareAsImage", id);
            const $target = $(`#${id}`);
            $target.addClass("screenshotting");
            $(".todo-page .detail-panel").css("width", "600px");

            function clean() {
                $target.removeClass("screenshotting");
                $(".todo-page .detail-panel").css("width", "");
            }
            setTimeout(() => {
                domtoimage
                    .toPng($target[0])
                    .then(dataUrl => {
                        var img = new Image();
                        img.src = dataUrl;
                        this.shareImage(dataUrl);
                        // document.body.appendChild(img);
                        clean();
                    })
                    .catch(function(error) {
                        clean();
                        alert("failed");
                        console.error("oops, something went wrong!", error);
                    });
            }, 200);
        },
        toggleMessageBox() {
            this.showingMessageBox = !this.showingMessageBox;
        },
        unwatchList(list) {
            list.forEach(item => {
                socket.emit(
                    "unwatch",
                    { id: item.id },
                    ({ data: { list } }) => {
                        store.commit("setTodoList", list);
                    }
                );
            });
        },
        deleteAll(list) {
            if (!confirm("Unwatch All?")) {
                return;
            }
            this.unwatchList(list);
        }
    },
    components: {
        TodoPanel,
        TodoList,
        UserSelector,
        Modal,
        ReportViewer,
        ImageShare,
        MessageBox
    }
};
</script>
