<template>
    <div class="generate-panel root-panel todo-panel-component">
        <h2 class="current-mode">
            <span>{{$t(mode)}}</span>
            <span v-if="unsaved && mode==='Edit'" class="unsaved">(unsaved)</span>
        </h2>
        <TodoViewer :userList="userList" ref="viewer" v-if="mode==='View'"></TodoViewer>
        <TodoEditor :userList="userList" ref="editor" v-if="mode==='Edit'||mode==='Create'" @change="onChange" :mode="mode"></TodoEditor>
        <!--<div class="create-btn">
                                                                                                                                                                                                                                        <i class="fa fa-plus-square-o"></i>
                                                                                                                                                                                                                                    </div>-->
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
            <button v-if="mode==='View'&&page==='todo'" class="btn btn-default submit" @click="newOne">
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
            <button v-if="mode==='View'&&page==='view'&&!logged" class="btn btn-success submit" @click="goLogin">
                <i class="fa fa-save"></i>
                {{$t('goLogin')}}
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
        socket.emit("getUserList", {}, ({ code, data: { list } }) => {
            const userMap = {};
            list.forEach(user => {
                userMap[user.uid] = user.name;
            });
            this.userList = list.map((user) => ({ label: `${user.name}`, value: user.uid }));
            store.commit("setUserMap", userMap);
        });
    },

    data() {
        return {
            mode: "Create",
            info: {

            },
            userList: [],
            unsaved: false,
            priorityMap: {
                verbose: 'delay it as u want(~)',
                normal: 'do it when u have time(.)',
                warn: 'do it as soon as possible(!)',
                danger: 'do it right now(!!!)',
            },
        }
    },
    computed: {
        logged: () => store.state.logged
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
            console.log('onChange')
            this.unsaved = true;
        },
        set(info = this.info) {
            info = JSON.parse(JSON.stringify(info));
            if (!info.priority) {
                info.priority = "normal";
            }
            this.info = info;
            this.$refs.viewer && this.$refs.viewer.set(info);
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
            if (this.info.requestor !== store.state.user.uid && this.info.owner !== store.state.user.uid) {
                alert("Only requestor or owner can mutate it");
                return;
            }
            this.mode = 'Edit';
            setTimeout(() => {
                this.set();
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
        newOne() {
            this.$emit('newOne');
        },
        goLogin() {
            window.router.push({
                name: 'Login',
                params: {
                    target: "View"
                }
            });
        },
    },
    components: {
        datepicker,
        TodoViewer,
        TodoEditor
    }

}

</script>
