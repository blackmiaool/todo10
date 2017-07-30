<template>
    <div class="list-page-wrap list-page">
        <TodoPanel page="list" v-show="userName&&list.length&&selecting" ref="todoPanel" :editing="editing" @fork="onFork"></TodoPanel>
        <!--<TodoList :list="list" ref="list" @select="onSelect"></TodoList>-->
        <div class="list-panel">
            <div class="projects-wrap">
                <router-link :to="'/list?project='+project.id" class="clickable btn btn-primary" v-for="project in projects" :key="project.id">{{project.name}}</router-link>
            </div>
            <div class="list-panel-content" v-if="project">
                <header class="filter-wrap">
                    <div>
                        <label>
                            <i class="fa fa-cubes"></i>
                            Project: {{projectName}}
                        </label>
                    </div>
                    <!--<div class="tags">
                            <router-link :to="'/list?project='+project.id+'&tag='+tag.id" class="clickable" v-for="tag in tags" :key="tag.id">{{project.name}}</router-link>
                        </div>-->
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

export default {
    name: 'List',
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
        projectName() {
            return store.getters.project2name(this.project);
        },
        projects() {
            return store.state.projects;
        }
    },
    mounted() {
        this.init();
    },
    data() {
        return {
            selecting: undefined,
            editing: undefined,
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
                this.list = result.reverse();
                if (this.$route.query.id) {
                    this.view(this.$route.query.id);
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
            if (item.id == this.selecting) {
                this.selecting = undefined;
                return;
            }
            this.$refs.todoPanel.view(item);
            this.selecting = item.id;

        },

    },
    components: {
        TodoPanel,
        TodoLi
    }

}

</script>
