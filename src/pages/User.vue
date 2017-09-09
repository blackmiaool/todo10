<template>
    <div class="list-page-wrap list-page">
        <div style="width:360px;float:right;height:100%">
            <TodoPanel page="list" v-show="userName&&list.length&&inList(selecting)" ref="todoPanel" @watch="onWatch" @unwatch="unWatch"></TodoPanel>
        </div>
    
        <!--<TodoList :list="list" ref="list" @select="onSelect"></TodoList>-->
        <div class="list-panel">
            <div class="projects-wrap">
                <router-link :to="'/user?uid='+user.uid" class="clickable btn btn-primary" v-for="user in userMap" :key="user.uid">{{user.name}}</router-link>
            </div>
            <div class="list-panel-content" v-if="uid">
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
        userMap() {
            return store.state.userMap;
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
            editing: undefined,
            project: undefined,
            tag: undefined,
            list: [
            ],
            today: (new Date()).format("yyyy-MM-dd"),
            uid: undefined,
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
        projectInfo(project) {
            return store.getters.projectInfo(project);
        },
        init() {
            this.uid = this.$route.query.uid;
            const query = {};
            if (this.uid) {
                query.uid = this.uid;
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
    },
    components: {
        TodoPanel,
        TodoLi
    }

}

</script>
