<template>
    <div class="generate-panel root-panel todo-creator-component">
        <h2 class="current-mode">
            <span>{{mode}}</span>
            <span v-if="unsaved && mode==='Edit'" class="unsaved">(unsaved)</span>
        </h2>
        <TodoViewer ref="viewer" v-if="mode==='View'" :editing="editing"></TodoViewer>
        <TodoEditor ref="editor" v-if="mode==='Edit'||mode==='Create'" @change="onChange"></TodoEditor>
    
        <div class="input-block">
            <button v-if="mode==='Create'" class="btn btn-success submit" @click="create">Create</button>
            <button v-if="mode==='View'" class="btn btn-primary submit" @click="edit">Edit</button>
            <button v-if="mode==='View'" class="btn btn-success submit" @click="fork">Copy and Create (fork)</button>
            <button v-if="mode==='Edit'" class="btn btn-success submit" @click="save">Save</button>
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
            console.log('socket', socket.context.logged)
            if (!socket.context.logged) {
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
            info: {
                title: "abc",
                content: "abc",
                creator: "Yourself",
                deadline: 1499257423548,
                assignee: "Yourself",
                priority: "normal",
                selectedTags: ["编辑器", "活动", "app-rn"],
                commonTags: ["有品", '老米家', '微信', 'PC站', '小程序'],
            },
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

    },
    props: ['onCreate', 'mode', 'editing'],
    watch: {
        mode() {
            this.unsaved = false;
        },
    },
    methods: {
        onChange() {
            console.log('onChange')
            this.unsaved = true;
        },
        set(info = this.info) {
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
            console.log(store.state.user.name, this.info.assignee);
            if (this.info.creator !== store.state.user.name && this.info.assignee !== store.state.user.name) {
                alert("Only creator or assignee can mutate it");
                return;
            }
            this.$emit("edit");
        },
        fork() {

        },
        save() {
            this.unsaved = false;
        },
        create() {
            let deadline;
            if (this.deadline) {
                deadline = new Date(this.deadlineText).getTime();
            }
            this.$emit('create', {
                assignee: this.assignee,
                deadline: deadline,
                priority: this.priority,
                selectedTags: this.selectedTags
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