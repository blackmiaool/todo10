<template>
    <div ref="wrap" class="detail-panel todo-panel-component" @drop="drop" @dragenter="dragEnter" @dragleave="dragLeave" @dragexit="dragExit" @dragover="dragOver" @mouseover="dragClear">
        <h2 class="current-mode">
            <span>{{$t(mode)}}</span>
            <span v-if="unsaved && mode==='Edit'" class="unsaved">(unsaved)</span>
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
                {{$t('Copy and Create (fork)')}}
            </button>
            <button v-if="mode==='View'&&page==='todo'" class="btn btn-default submit" @click="emit('newOne')">
                <i class="fa fa-plus-square-o"></i>
                {{$t('New')}}
            </button>
            <button v-if="mode==='View'&&page==='todo'" class="btn btn-warning submit" @click="share">
                <i class="fa fa-share-alt"></i>
                {{$t('Share')}}
            </button>
            <button v-if="mode==='Edit'" class="btn btn-success submit" @click="save">
                <i class="fa fa-save"></i>
                {{$t('Save')}}
            </button>
            <button v-if="mode==='View'&&page==='todo'" class="btn btn-danger submit" @click="transfer">
                <i class="fa fa-paper-plane"></i>
                {{$t('Transfer')}}
            </button>
            <button v-if="mode==='View'&&page==='view'&&!logged" class="btn btn-success submit" @click="emit('login')">
                <i class="fa fa-save"></i>
                {{$t('goLogin')}}
            </button>
            <button v-if="canWatch" class="btn btn-success submit" @click="emit('watch')">
                <i class="fa fa-bookmark-o"></i>
                {{$t('Watch')}}
            </button>
            <button v-if="canUnwatch&&page==='view'" class="btn btn-danger submit" @click="emit('unwatch')">
                <i class="fa fa-bookmark"></i>
                {{$t('Unwatch')}}
            </button>
        </div>
    </div>
</template>

<script>
import $ from "jquery";
import socket from "../io";

import eventHub from '../eventHub';
import settings from '../settings';
import datepicker from 'vue-date';
import TodoViewer from 'components/TodoViewer';
import TodoEditor from 'components/TodoEditor';
import store from 'store';

export default {
    name: 'TodoPanel',
    created() {

    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            console.log('store.state.logged', store.state.logged)
            if (!store.state.logged) {
                router.replace("/login")
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
            info: {

            },
            unsaved: false,
        }
    },
    computed: {
        userList() {
            const list = [];
            for (const uid in store.state.userMap) {
                const label = store.state.userMap[uid].name;
                const value = uid;
                list.push({
                    label,
                    value,
                })
            }
            return list;
        },
        logged: () => store.state.logged,
        canUnwatch() {
            return this.logged && this.info.watchers && this.info.watchers[store.state.user.uid];
        },
        canWatch() {
            return this.logged && this.info.watchers && !this.info.watchers[store.state.user.uid];
        }
    },
    props: ["page"],
    watch: {
        mode() {
            this.unsaved = false;
        },
    },
    methods: {
        share() {
            prompt("Copy link to share", `${location.origin}/#/view?id=${this.info.id}`);
        },
        view(info) {
            this.mode = 'View';
            setTimeout(() => {
                this.set(info);
            });
        },
        setMode(mode) {
            if (mode === 'Edit') {
                this.edit();
            }
            this.mode = mode;
        },
        onChange() {
            this.unsaved = true;
        },
        set(info = this.info) {
            info = JSON.parse(JSON.stringify(info));
            this.info = info;
            this.$refs.viewer && this.$refs.viewer.set(info.id);
            this.$refs.editor && this.$refs.editor.set(info);
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
            if (this.info.requestor != store.state.user.uid && this.info.owner != store.state.user.uid) {
                alert("Only requestor or owner can mutate it");
                return;
            }
            this.mode = 'Edit';
            setTimeout(() => {
                this.set();
                this.unsaved = false;
            });
        },
        fork() {
            this.$emit('fork', this.info);
        },
        save() {
            this.unsaved = false;
            this.$emit('save', this.$refs.editor.get());
        },
        create() {
            this.$emit('create', this.$refs.editor.get());
        },
        emit(...rags) {
            this.$emit(...rags);
        },
        transfer() {
            this.$emit('transfer', this.info.id);
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
                if (item.kind === 'file') {
                    const reader = new FileReader();
                    const instance = this;
                    reader.onloadend = function (e) {
                        if (!that.$refs.editor) {
                            alert("You can just upload file in edit mode");
                            return;
                        }
                        that.$refs.editor.appendFile(files[index].name, this.result);
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
        },
    },
    components: {
        datepicker,
        TodoViewer,
        TodoEditor
    }

}

</script>
