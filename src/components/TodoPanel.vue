<template>
    <div class="generate-panel root-panel todo-panel-component">
        <h2 class="current-mode">
            <span>{{mode}}</span>
            <span v-if="unsaved && mode==='Edit'" class="unsaved">(unsaved)</span>
        </h2>
        <TodoViewer ref="viewer" v-if="mode==='View'"></TodoViewer>
        <TodoEditor ref="editor" v-if="mode==='Edit'||mode==='Create'" @change="onChange" :mode="mode"></TodoEditor>
        <!--<div class="create-btn">
                                                                                <i class="fa fa-plus-square-o"></i>
                                                                            </div>-->
        <div>
            <button v-if="mode==='Create'" class="btn btn-success submit" @click="create">
                <i class="fa fa-arrow-circle-o-up"></i> Create</button>
            <button v-if="mode==='View'" class="btn btn-primary submit" @click="edit">
                <i class="fa fa-pencil-square-o"></i> Edit</button>
            <button v-if="mode==='View'" class="btn btn-success submit" @click="fork">
                <i class="fa fa-code-fork"></i> Copy and Create (fork)</button>
            <button v-if="mode==='View'" class="btn btn-default submit" @click="newOne">
                <i class="fa fa-plus-square-o"></i>
                New
            </button>
            <button v-if="mode==='Edit'" class="btn btn-success submit" @click="save">
                <i class="fa fa-save"></i> Save</button>
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
            mode: "Create",
            info: {

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
    props: [],
    watch: {
        mode() {
            this.unsaved = false;
        },
    },
    methods: {
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
            console.log(store.state.user.name, this.info.owner);
            if (this.info.requestor !== store.state.user.name && this.info.owner !== store.state.user.name) {
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
        }
    },
    components: {
        datepicker,
        TodoViewer,
        TodoEditor
    }

}

</script>
