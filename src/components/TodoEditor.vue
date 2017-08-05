<template>
    <div class="todo-editor">
        <span class="id-detail">id:{{id}}</span>
        <div class="input-block">
            <label for="new-todo-title">
                <i class="fa fa-pencil"></i>
                {{$t("Title")}}
            </label>
            <input type="text" id="new-todo-title" class="form-control" :placeholder="$t('TitlePlaceholder')" v-model="title">
    
        </div>
        <div class="input-block">
            <label for="new-todo-content">
                <i class="fa fa-paint-brush"></i>
                {{$t("Description")}}
            </label>
            <textarea type="text" id="new-todo-content" class="form-control" :placeholder="$t('DescriptionPlaceholder')" v-model="description"></textarea>
    
        </div>
        <div class="input-block">
            <label>
                <i class="fa fa-cubes"></i>
                {{$t('Projects')}}
    
            </label>
            <div data-mode="Edit" class="selected-tags" v-if="projects&&projects.length">
                <span :key="project" v-for="project in projects" class="selected-tag clickable" @click="removeProject(project)">{{projectInfo(project).name}}</span>
            </div>
            <div data-mode="Edit" class="common-tags">
                <span :key="tag.id" v-for="tag in allProjects" class="common-tag clickable" @click="selectProject(tag)">{{tag.name}}</span>
            </div>
        </div>
        <div class="input-block">
            <label>
                <i class="fa fa-tags"></i>
                {{$t('Tags')}}
            </label>
            <div v-if="!availableTags.length">Select a project first</div>
            <div data-mode="Edit" class="selected-tags" v-if="tags&&tags.length">
                <span :key="tag" v-for="tag in tags" class="selected-tag clickable" @click="removeTag(tag)">{{tagInfo(tag).name}}</span>
            </div>
            <div data-mode="Edit" class="common-tags">
                <span :key="tag.id" v-for="tag in availableTags" class="common-tag clickable" @click="selectTag(tag.id)">{{tag.name}}</span>
            </div>
    
        </div>
        <div class="input-block">
            <label for="choose-priority">
                <i class="fa fa-bomb"></i>
                {{$t('Priority')}}
            </label>
            <select id="choose-priority" class="form-control" v-model="priority">
                <option value="3">{{$t('priorityMap[3]')}}</option>
                <option value="2">{{$t('priorityMap[2]')}}</option>
                <option value="1">{{$t('priorityMap[1]')}}</option>
                <option value="0">{{$t('priorityMap[0]')}}</option>
            </select>
    
        </div>
        <div class="input-block">
            <label for="choose-deadline">
                <i class="fa fa-calendar-o"></i>
                {{$t('Deadline (not recommended)')}}
            </label>
            <datepicker v-model="deadlineText"></datepicker>
    
        </div>
        <div class="input-block">
            <label for="choose-assigner">
                <i class="fa fa-user-o"></i>
                {{$t('Requestor')}}
            </label>
            <input readonly type="text" id="choose-requestor" class="form-control" v-model="realRequestor">
    
        </div>
        <div class="input-block">
            <label for="choose-owner">
                <i class="fa fa-user-circle-o"></i>
                {{$t('Owner')}}
            </label>
            <v-select v-if="mode==='Create'" :value.sync="targetOwner" :options="userList" placeholder="search..." :onChange="onSelectOwner">
            </v-select>
            <div v-if="mode==='Edit'">{{uid2name(owner)}}</div>
        </div>
        <div class="input-block">
            <label for="choose-owner">
                <i class="fa fa-file"></i>
                {{$t('Attachments (200MB limit)')}}
            </label>
            <input @change="onFileUpload" type="file" accept="*">
            <FileList v-model="attachments" mode="edit"></FileList>
        </div>
    </div>
</template>

<script>
import $ from "jquery";
import datepicker from 'vue-date';
import store from 'store';
import VueSelect from "vue-select";
import socket from "../io";
import Vue from "vue";
import FileList from 'components/FileList';
const loadImage = require("blueimp-load-image");
function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
const properties = {
    id: "",
    title: "",
    description: "",
    requestor: "",
    deadline: "",
    deadlineText: "",
    owner: "",
    priority: "",
    selectedTags: [],
    commonTags: [],
    projects: [],
    attachments: [],
    watchers: {},
    tags: [],
}
Vue.filter('url2fileName', function (value) {
    const arr = value.split('/');
    return arr[arr.length - 1];
});
export default {
    name: 'TodoEditor',
    created() {

    },

    mounted() {
        let timeout;
        Object.keys(properties).forEach((key) => {
            this.$watch(key, (v) => {
                if (this.preventEdit) {
                    return;
                }
                this.$emit('change');
                // if (timeout) {
                //     clearTimeout(timeout);
                // }
                // timeout = setTimeout(() => {

                //     timeout = 0;
                //     this.$emit('change');
                // });
            });
        });
    },

    data() {
        return {
            ...clone(properties),
            preventEdit: false,
            priorityMap: {
                3: '(C) delay it as u want~',
                2: '(B) do it when u have time.',
                1: '(A) do it as soon as possible!',
                0: '(S) do it right now!!!',
            },
            targetOwner: ""
        }
    },
    computed: {

        userName: () => store.state.user.name,
        realRequestor: function () {
            return this.mode === 'Edit' ? this.uid2name(this.requestor) : this.userName;
        },
        allProjects() {
            const map = {};
            Object.assign(map, store.state.projects);
            this.projects.forEach((project) => {
                delete map[project];
            });
            const list = [];
            for (const id in map) {
                list.push(map[id]);
            }
            return list;
        },
        availableTags() {
            let tags = [];
            this.projects.forEach((project) => {
                tags = tags.concat(store.state.projects[project].tags);
            });
            tags = tags.filter((tag) => {
                return this.tags.indexOf(tag.id) === -1
            });
            return tags;

        }
    },
    props: ["change", 'mode', 'userList'],
    watch: {
        deadline(v) {
            console.log('v', v);
            this.deadlineText = new Date(v).format("yyyy-MM-dd hh:mm:ss");
        }
    },
    methods: {
        tagInfo: (id) => store.getters.tagInfo(id),
        projectInfo: (id) => store.getters.projectInfo(id),
        uid2name(uid) {
            const user = this.userList.find((user) => user.value == uid);
            if (user) {
                return user.label;
            } else {
                return 'not found'
            }
        },
        onSelectOwner(owner) {
            if (owner) {
                this.owner = owner.value;
            } else {
                this.owner = undefined;
            }
        },
        selectTag(tagId) {
            // const index = this.commonTags.indexOf(tag);
            this.tags.push(tagId);
            // this.commonTags.splice(index, 1);
        },
        removeTag(tag) {
            const index = this.tags.indexOf(tag);
            this.tags.splice(index, 1);
        },
        getDeadline() {
            let deadline = 0;
            if (this.deadlineText) {
                deadline = new Date(this.deadlineText + " 00:00:00").getTime();
            }
            return deadline;
        },
        get() {
            const ret = {
                title: this.title,
                description: this.description,
                deadline: this.getDeadline(),
                priority: this.priority,
                selectedTags: this.selectedTags,
                owner: this.owner,
                status: this.status,
                attachments: this.attachments,
                projects: this.projects,
                tags: this.tags
            }
            if (this.mode === 'Create') {
                Object.assign(ret, {
                    requestor: store.state.user.uid,
                });
                ret.watchers = {};
                if (ret.owner) {
                    ret.watchers[ret.owner] = true;
                }
                if (ret.requestor) {
                    ret.watchers[ret.requestor] = true;
                }

            } else if (this.mode === 'Edit') {
                Object.assign(ret, {
                    id: this.id,
                    requestor: this.requestor,
                    watchers: this.watchers,
                });
            }
            return ret;
        },
        set(info) {
            if (!info.deadline) {
                info.deadline = '';
            }
            Object.assign(this, clone(properties));
            Object.assign(this, info);
            this.preventEdit = true;

            this.commonTags = JSON.parse(JSON.stringify(store.state.commonTags));
            if (info.selectedTags) {
                info.selectedTags.forEach((v) => {
                    const index = this.commonTags.indexOf(v);
                    if (index > -1) {
                        this.commonTags.splice(index, 1);
                    }

                });
            }
            if (info.owner) {
                this.targetOwner = this.userList.find((user) => user.value == info.owner)
            }


            setTimeout(() => {
                this.preventEdit = false;
            });
        },
        appendFile(name, data) {
            this.doUpload(this.id, name, data).then((url) => {
                this.attachments.push(url);
            });
        },
        doUpload(id, name, data) {
            return new Promise((resolve) => {
                socket.emit("upload", { id, data, name }, (url) => {
                    resolve(url);
                });
            });
        },
        onFileUpload(e) {
            const getBase64 = (file) => {
                var reader = new FileReader();
                if (!file) {
                    return;
                }
                reader.readAsDataURL(file);
                reader.onload = () => {
                    this.doUpload(this.id, file.name, reader.result).then((url) => {
                        this.attachments.push(url);
                    });
                };
                reader.onerror = function (error) {
                    console.log('Error: ', error);
                };
            }

            const file = e.target.files[0];
            getBase64(file);

        },
        selectProject(project) {
            this.projects.push(project.id);

        },
        removeProject(project) {
            const index = this.projects.indexOf(project);
            this.projects.splice(index, 1);
            this.projectInfo(project).tags.forEach((tag) => {
                const index = this.tags.indexOf(tag.id);
                if (index > -1) {
                    this.tags.splice(index, 1);
                }
            });
        },
    },
    components: {
        datepicker,
        'v-select': VueSelect,
        FileList
    }

}

</script>
