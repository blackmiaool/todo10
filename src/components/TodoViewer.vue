<template>
    <div class="todo-viewer" id="todo-viewer">
        <span class="id-detail">id:{{id}}</span>
        <div v-if="title" class="input-block">
    
            <label for="new-todo-title">
                <i class="fa fa-pencil"></i>
                {{$t('Title')}}
            </label>
            <p>{{title}}</p>
    
        </div>
    
        <div v-if="description" class="input-block">
            <label for="new-todo-content">
                <i class="fa fa-paint-brush"></i>
                {{$t('Description')}}
            </label>
            <pre>{{description}}</pre>
        </div>
    
        <div v-if="projects&&projects.length" class="input-block">
            <label>
                <i class="fa fa-cube"></i>
                {{$t('Projects')}}
            </label>
            <div data-mode="View" class="selected-tags">
                <span :key="project" v-for="project in projects" class="selected-tag clickable" @click="goProject(project)">{{projectInfo(project).name}}</span>
            </div>
        </div>
    
        <div v-if="tags&&tags.length" class="input-block">
            <label>
                <i class="fa fa-tags"></i>
                {{$t('Tags')}}
            </label>
            <div data-mode="View" class="selected-tags">
                <span :key="tag" v-for="tag in tags" class="selected-tag clickable">{{tagInfo(tag).name}}</span>
            </div>
        </div>
    
        <div class="input-block" v-if="priority">
            <label for="choose-priority">
                <i class="fa fa-bomb"></i>
                {{$t('Priority')}}
            </label>
            <p>{{$t('priorityMap['+priority+']')}}</p>
        </div>
    
        <div v-if="formattedDeadline" class="input-block">
            <label for="choose-deadline">
                <i class="fa fa-calendar-o"></i>
                {{$t('Deadline (not recommended)')}}
            </label>
            <p>{{formattedDeadline}}</p>
        </div>
    
        <div class="input-block" style="display:inline-block;width:48%;">
            <label for="choose-assigner">
                <i class="fa fa-user-o"></i>
                {{$t('Requestor')}}
            </label>
            <p>{{requestorName}}</p>
        </div>
        <div class="input-block" style="display:inline-block;width:48%;">
            <label for="choose-owner">
                <i class="fa fa-user-circle-o"></i>
                {{$t('Owner')}}
            </label>
            <p>{{ownerName}}</p>
            <i class="fa fa-long-arrow-right owner-arrow"></i>
        </div>
    
        <div class="input-block" v-if="watchers&&Object.keys(watchers).length">
            <label for="choose-owner">
                <i class="fa fa-group"></i>
                {{$t('Watchers')}}
            </label>
            <div>
                <span class="watcher" :key="watcher" v-for="watcher in handledWatchers">{{watcher}}</span>
            </div>
    
        </div>
    
        <div class="input-block" v-if="attachments&&attachments.length">
            <label for="choose-owner">
                <i class="fa fa-file"></i>
                {{$t('Attachments (200MB limit)')}}
            </label>
            <FileList v-model="attachments" mode="view"></FileList>
        </div>
    
        <div class="input-block" v-if="history&&history.length">
            <label for="choose-owner">
                <i class="fa fa-history"></i>
                {{$t('History')}}
            </label>
            <div>
                <button class="btn btn-default" @click="showHistory=!showHistory">{{$t(showHistory?'Hide':'Show')}}</button>
            </div>
            <div v-if="showHistory">
                <div v-for="li in history" :key="li.time">
                    <header>
                        <span>{{time2str(li.time)}}</span>
                        <span>{{getUserName(li.uid)}}</span>
                        {{$t('set')}} {{$t(li.key)}}
                    </header>
                    <main :title="'previous: '+(li.source||'nothing')">
    
                        <div v-if="li.key==='projects'" data-mode="View" class="selected-tags">
                            <span :key="project" v-for="project in li.target" class="selected-tag clickable" @click="goProject(project)">{{projectInfo(project).name}}</span>
                        </div>
                        <div v-else-if="li.key==='tags'" data-mode="View" class="selected-tags">
                            <span :key="project" v-for="project in li.target" class="selected-tag clickable">{{tagInfo(project).name}}</span>
                        </div>
                        <div v-else>
                            {{li.target}}
                        </div>
                    </main>
                </div>
            </div>
    
        </div>
    </div>
</template>

<script>
import $ from "jquery";
import socket from "../io";

import eventHub from '../eventHub';
import settings from '../settings';
import store from 'store';
import FileList from 'components/FileList';
const properties = {
    id: "",
    title: "",
    description: "",
    requestor: "",
    deadline: "",
    deadlineText: "",
    owner: "",
    priority: "",
    tags: [],
    commonTags: [],
    attachments: [],
    watchers: {},
    projects: [],
    history: undefined,
}
export default {
    name: 'TodoViewer',
    created(p) {
    },
    mounted() {

    },

    data() {
        return {
            ...properties,
            showHistory: false,
            priorityMap: {
                3: '(C) delay it as u want~',
                2: '(B) do it when u have time.',
                1: '(A) do it as soon as possible!',
                0: '(S) do it right now!!!',
            },
            selectingId: undefined,
            reactive: undefined
        }
    },
    computed: {
        requestorName() {
            return store.getters.uid2name(this.requestor);
        },
        ownerName() {
            return store.getters.uid2name(this.owner);
        },
        formattedDeadline() {
            if (this.deadline) {
                return new Date(this.deadline).format("yyyy-MM-dd hh:mm:ss");
            } else {
                return ""
            }

        },
        descriptionHandled() {
            return this.description.replace(/\n/g, "<br/>")
        },
        handledWatchers() {
            const ret = [];
            for (const uid in this.watchers) {
                ret.push(store.getters.uid2name(uid));
            }
            return ret;
        },
        theInfo() {
            return store.state.list.find((li) => li.id == this.selectingId);
        }
    },
    props: ['userList'],
    watch: {
        theInfo() {
            if (this.reactive) {
                this.set(this.selectingId);
            }
        }
    },
    methods: {
        getUserName(uid) {
            return store.getters.uid2name(uid);
        },
        time2str(time) {
            return (new Date(time)).format('yyyy-MM-dd hh:mm')
        },
        tagInfo: (id) => store.getters.tagInfo(id),
        projectInfo: (id) => store.getters.projectInfo(id),
        set(id) {
            let info;
            if (typeof id === 'object') {
                this.reactive = false;
                this.selectingId = id.id;
                info = id;

            } else {
                this.reactive = true;
                this.selectingId = id;
                info = store.state.list.find((li) => li.id == id);
            }

            Object.assign(this, properties);
            Object.assign(this, info);

        },
        goProject(project) {
            window.router.push({
                name: 'List',
                query: {
                    project
                }
            });
        }
    },
    components: {
        FileList
    }

}

</script>
