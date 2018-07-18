<template>
    <div ref="wrap" class="detail-panel todo-panel-component" @drop="drop" @dragenter="dragEnter" @dragleave="dragLeave" @dragexit="dragExit" @dragover="dragOver" @mouseover="dragClear">
        <h2 class="current-mode">
            <span>{{$t(mode)}}</span>
            <span v-if="unsaved" class="unsaved">({{$t('unsaved')}})
                <span class="hide glyphicon glyphicon-trash clickable"></span>
            </span>
            <span class="btn btn-primary btn-xs" v-if="unsavedMap[info.id||0]" @click="restore()">
                <span class="glyphicon glyphicon-edit clickable"></span> {{$t('Restore Draft')}}
            </span>
        </h2>
        <TodoViewer :userList="userList" ref="viewer" v-if="mode==='View'"></TodoViewer>
        <TodoEditor :userList="userList" ref="editor" v-if="mode==='Edit'||mode==='Create'" @change="onChange" :mode="mode"></TodoEditor>
        <div>
            <button v-if="mode==='Create'" class="btn btn-success submit" @click="create">
                <i class="fa fa-arrow-circle-o-up"></i>
                {{$t('Create')}}
            </button>
            <button v-if="mode==='View'&&page==='todo'" class="btn btn-primary submit" @click="edit">
                <i class="fa fa-pencil-square-o"></i>
                {{$t('Edit')}}
            </button>
            <button v-if="mode==='View'&&page==='todo'" class="btn btn-success submit" @click="fork">
                <i class="fa fa-code-fork"></i>
                {{$t('Fork')}}
            </button>
            <button v-if="(mode==='View'||mode==='Edit')&&page==='todo'" class="btn btn-default submit" @click="invitePartner">
                <i class="fa fa-wheelchair"></i>
                {{$t('Add partner')}}
            </button>
            <!-- <button v-if="mode==='View' &&page==='todo' " class="btn btn-default submit " @click="shareAsImage ">
                <i class="fa fa-image "></i>
                {{$t('Share as Image')}}
            </button> -->
            <button v-if="mode==='View' " class="btn btn-warning submit " @click="share ">
                <i class="fa fa-share-alt "></i>
                {{$t('Share')}}
            </button>
            <button v-if="mode==='Edit' " class="btn btn-success submit " @click="save ">
                <i class="fa fa-save "></i>
                {{$t('Save')}}
            </button>
            <button v-if="mode==='View' &&page==='todo' " class="btn btn-danger submit " @click="transfer ">
                <i class="fa fa-paper-plane "></i>
                {{$t('Transfer')}}
            </button>
            <button v-if="mode==='View' &&page==='view' &&!logged " class="btn btn-success submit " @click="$emit( 'login') ">
                <i class="fa fa-save "></i>
                {{$t('goLogin')}}
            </button>
            <button v-if="canWatch " class="btn btn-success submit " @click="$emit( 'watch') ">
                <i class="fa fa-bookmark-o "></i>
                {{$t('Watch')}}
            </button>
            <button v-if="canUnwatch&&page!=='todo' " class="btn btn-danger submit " @click="$emit( 'unwatch') ">
                <i class="fa fa-bookmark "></i>
                {{$t('Unwatch')}}
            </button>
        </div>
    </div>
</template>

<script>
import $ from "jquery";
import socket from "../io";

import eventHub from "../eventHub";
import settings from "../settings";
import datepicker from "vue-date";
import TodoViewer from "components/TodoViewer";
import TodoEditor from "components/TodoEditor";
import store from "store";

export default {
    name: "TodoPanel",
    created() {},
    beforeRouteEnter(to, from, next) {
        next(vm => {
            console.log("store.state.logged", store.state.logged);
            if (!store.state.logged) {
                router.replace("/login");
                return;
            }
        });
    },
    mounted() {
        setTimeout(() => {
            this.set();
        });
    },
    data() {
        return {
            mode: "Create",
            info: {},
            unsavedMap: {}
        };
    },
    computed: {
        userList() {
            const list = [];
            for (const uid in store.state.userMap) {
                const label = store.state.userMap[uid].name;
                const value = uid;
                list.push({
                    label,
                    value
                });
            }
            return list;
        },
        unsaved: () => store.state.unsaved,
        logged: () => store.state.logged,
        canUnwatch() {
            return (
                this.logged &&
                this.info.watchers &&
                this.info.watchers[store.state.user.uid]
            );
        },
        canWatch() {
            return (
                this.logged &&
                this.info.watchers &&
                !this.info.watchers[store.state.user.uid]
            );
        }
    },
    props: ["page"],
    watch: {
        mode() {
            store.commit("setUnsaved", false);
        }
    },
    methods: {
        invitePartner() {
            this.$store.dispatch("selectUser").then(uid => {
                socket.emit(
                    "addPartner",
                    {
                        uid,
                        id: this.info.id
                    },
                    ({ data: { list } }) => {
                        store.commit("setTodoList", list);
                    }
                );
            });
        },
        restore() {
            let id;
            if (!this.info.id) {
                this.mode = "Create";
                id = 0;
            } else {
                this.edit();
                id = this.info.id;
            }
            setTimeout(() => {
                this.set(this.unsavedMap[id]);
                store.commit("setUnsaved", true);
                delete this.unsavedMap[id];
            });
        },
        share() {
            prompt(
                "Copy link to share",
                `${location.origin}/#/view?id=${this.info.id}`
            );
        },
        shareAsImage() {
            this.$emit("shareAsImage", "todo-viewer");
        },
        unsavedBackup() {
            if (store.state.unsaved) {
                const editedInfo = this.$refs.editor.get();
                if (editedInfo.id) {
                    this.unsavedMap[editedInfo.id] = editedInfo;
                } else {
                    this.unsavedMap[0] = editedInfo;
                }
            }
        },
        view(info) {
            this.unsavedBackup();
            this.mode = "View";

            setTimeout(() => {
                this.set(info);
            });
        },
        setMode(mode) {
            if (mode === "Edit") {
                this.edit();
            }
            this.mode = mode;
        },
        onChange() {
            // const content = this.$refs.editor.get();
            // console.log(content);
            this.$store.commit("setUnsaved", true);
        },
        set(info = this.info) {
            info = JSON.parse(JSON.stringify(info));
            this.info = info;
            if (store.state.list.find(li => li.id == info.id)) {
                this.$refs.viewer && this.$refs.viewer.set(info.id);
            } else {
                this.$refs.viewer && this.$refs.viewer.set(info);
            }
            setTimeout(() => {
                this.$refs.editor && this.$refs.editor.set(info);
            });
        },
        selectTag(tag) {
            const index = this.commonTags.indexOf(tag);
            this.selectedTags.push(tag);
            this.commonTags.splice(index, 1);
        },
        removeTag(tag) {
            const index = this.selectedTags.indexOf(tag);
            this.commonTags.push(tag);
            this.selectedTags.splice(index, 1);
        },
        edit() {
            if (
                this.info.requestor != store.state.user.uid &&
                this.info.owner != store.state.user.uid &&
                !(
                    this.info.partners &&
                    this.info.partners[store.state.user.uid]
                )
            ) {
                alert(
                    this.$t("Only requestor or owner or partners can mutate it")
                );
                return;
            }
            this.mode = "Edit";
            setTimeout(() => {
                this.set();
                store.commit("setUnsaved", false);
            });
        },
        fork() {
            this.$emit("fork", this.info);
        },
        save() {
            store.commit("setUnsaved", false);
            this.$refs.editor.backup();
            const info = this.$refs.editor.get();
            if (info.id) {
                delete this.unsavedMap[info.id];
            } else {
                delete this.unsavedMap[0];
            }
            this.$emit("save", info);
        },
        createNew(info = {}) {
            this.unsavedBackup();
            this.mode = "Create";
            setTimeout(() => {
                this.set(info);
            });
        },
        create() {
            const info = this.$refs.editor.get();
            if (!info.title) {
                return alert(this.$t("Title is needed"));
            }
            if (!info.owner) {
                return alert(this.$t("Owner is needed"));
            }
            delete this.unsavedMap[0];
            this.$emit("create", info);
        },
        transfer() {
            this.$emit("transfer", this.info.id);
        },
        drop(e) {
            const dropEvent = e;
            this.$refs.wrap.classList.remove("dragging");
            e.stopPropagation();
            e.preventDefault();

            const that = this;
            const items = Array.prototype.slice.call(e.dataTransfer.items);

            const files = e.dataTransfer.files;
            items.forEach((item, index) => {
                if (item.kind === "file") {
                    const reader = new FileReader();
                    const instance = this;
                    reader.onloadend = function(e) {
                        if (!that.$refs.editor) {
                            alert("You can just upload file in edit mode");
                            return;
                        }
                        that.$refs.editor.appendFile(
                            files[index].name,
                            this.result
                        );
                    };
                    reader.readAsDataURL(item.getAsFile());
                }
            });
        },
        dragClear(e) {
            this.$refs.wrap.classList.remove("dragging");
        },
        dragEnter(e) {
            this.$refs.wrap.classList.add("dragging");
            e.stopPropagation();
            e.preventDefault();
        },
        dragExit(e) {
            e.stopPropagation();
            e.preventDefault();
        },
        dragLeave(e) {
            e.stopPropagation();
            e.preventDefault();
        },
        dragOver(e) {
            e.stopPropagation();
            e.preventDefault();
            //               e.stopPropagation(); // e.preventDefault();
        }
    },
    components: {
        datepicker,
        TodoViewer,
        TodoEditor
    }
};
</script>
