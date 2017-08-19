<template>
    <div class="list-page-wrap list-page">
        <div style="width:360px;float:right;height:100%">
            <TodoPanel page="list" v-show="userName&&list.length&&selecting" ref="todoPanel" @watch="onWatch" @unwatch="unWatch" @fork="onFork"></TodoPanel>
        </div>
        <div class="list-panel">
            <div class="projects-wrap">
                <router-link :to="'/list?project='+project.id" class="clickable btn btn-primary" v-for="project in projects" :key="project.id">{{project.name}}</router-link>
                <button class="btn btn-primary btn-xs" @click="addProject" title="add project">
                    {{$t('Add Project')}}
                    <i class="fa fa-plus"></i>
                </button>
            </div>
            <div class="list-panel-content" v-if="project">
                <header class="filter-wrap">
                    <div>
                        <label>
                            <i class="fa fa-cubes"></i>
                            {{$t('Project')}}: {{projectName}}
                            <button class="btn btn-primary btn-xs" @click="addTag(project)" :title="$t('add tag')">
                                {{$t('Add Tag')}}
                                <i class="fa fa-plus"></i>
                            </button>
                        </label>
    
                    </div>
                    <div class="tags">
    
                        <router-link :to="getLink(tag.id)" class="clickable" v-for="tag in projectInfo(project).tags" :key="tag.id">
                            <span class="top-tag" :class="{'active':!selectingTag||selectingTag==tag.id}">{{tag.name}}</span>
                        </router-link>
                    </div>
                </header>
                <div class="todo-wrap">
                    <header class="list-header">
    
                    </header>
                    <ul class="todo-list">
                        <TodoLi v-for="li in list" :info="li" :selected="li.id===selecting" :mutable="false" :key="li.id" @select="onSelect(li)">
                        </TodoLi>
                    </ul>
                </div>
            </div>
    
        </div>
    </div>
</template>

<script>
import $ from "jquery";
import socket from "../io";

import eventHub from 'eventHub';
import settings from 'settings';
import datepicker from 'vue-date';
import TodoPanel from 'components/TodoPanel';
import TodoLi from 'components/TodoLi';
import store from 'store';
import todoPanelMixin from 'mixins/todoPanelMixin';

export default {
    name: 'List',
    mixins: [todoPanelMixin],
    created() {

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
        projectName() {
            return store.getters.projectInfo(this.project).name;
        },
        projects() {
            return store.state.projects;
        },
        selectingTag() {
            return this.$route.query.tag;
        }
    },
    mounted() {
        this.init();
    },
    data() {
        return {
            project: undefined,
            tag: undefined,
            list: [
            ],
            today: (new Date()).format("yyyy-MM-dd")
        }
    },
    watch: {
        '$route': 'init'
    },
    methods: {
        getLink(id) {
            if (this.selectingTag != id) {
                return '/list?project=' + this.project + '&tag=' + id;
            } else {
                return '/list?project=' + this.project;
            }

        },
        addTag(projectId) {
            console.log('projectId', projectId);
            const name = prompt("New Tag Name");
            if (!name) {
                return;
            }
            socket.emit("addTag", { project: projectId, tag: name }, (result) => {
                console.log('result', result)
                store.dispatch('getProjects').then((projects) => { });
            });
        },
        projectInfo(project) {
            return store.getters.projectInfo(project);
        },
        init() {
            this.project = this.$route.query.project;
            this.tag = this.$route.query.tag;
            const query = {};
            if (this.project) {
                query.project = this.project;
            }
            if (this.tag) {
                query.tag = this.tag;
            }
            if (!Object.keys(query).length) {
                this.list = [];
                return;
            }
            socket.emit("getList", query, (result) => {
                this.list = result.data.reverse();
                if (this.selecting) {
                    this.view(this.selecting);
                } else if (this.$route.query.id) {
                    this.view(this.$route.query.id);
                }

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
        addProject() {
            const name = prompt('Give your project a name');
            if (!name) {
                return;
            }
            if (!name.trim()) {
                return;
            }
            socket.emit('addProject', { name }, () => {

            });
        },

    },
    components: {
        TodoPanel,
        TodoLi
    }

}

</script>
