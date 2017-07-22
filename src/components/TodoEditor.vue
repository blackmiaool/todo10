<template>
    <div class="todo-editor">
        <div class="input-block">
            <label for="new-todo-title">
                <i class="fa fa-pencil"></i>
                {{$t("Title")}}
            </label>
            <input type="text" id="new-todo-title" class="form-control" :placeholder="$t('TitlePlaceholder')" v-model="title">
            <span class="id-detail">id:{{id}}</span>
        </div>
        <div class="input-block">
            <label for="new-todo-content">
                <i class="fa fa-paint-brush"></i>
                {{$t("Description")}}
            </label>
            <textarea type="text" id="new-todo-content" class="form-control" :placeholder="$t('DescriptionPlaceholder')" v-model="description"></textarea>
    
        </div>
        <!--<div class="input-block">
                                                                        <label>
                                                                            <i class="fa fa-cubes"></i>
                                                                            Project
                                                                            <button class="btn btn-primary btn-xs">
                                                                                <i class="fa fa-plus"></i>
                                                                            </button>
                                                                        </label>
                                                                    </div>-->
        <div class="input-block">
            <label>
                <i class="fa fa-tags"></i>
                {{$t('Tags')}}
            </label>
            <div data-mode="Edit" class="selected-tags" v-if="selectedTags&&selectedTags.length">
                <span :key="tag" v-for="tag in selectedTags" class="selected-tag clickable" @click="removeTag(tag)">{{tag}}</span>
            </div>
            <div data-mode="Edit" class="common-tags">
                <span :key="tag" v-for="tag in commonTags" class="common-tag clickable" @click="selectTag(tag)">{{tag}}</span>
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
            <v-select :value.sync="targetOwner" :options="userList" placeholder="search..." :onChange="onSelectOwner">
            </v-select>
        </div>
        <div class="input-block">
            <label for="choose-owner">
                <i class="fa fa-file"></i>
                {{$t('Attachments (200MB limit)')}}
            </label>
            <input @change="fileUpload" type="file" accept="*">
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
    attachments: [],
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
            ...properties,
            preventEdit: false,
            priorityMap: {
                3: '(C) delay it as u want~',
                2: '(B) do it when u have time.',
                1: '(A) do it as soon as possible!',
                0: '(S) do it right now!!!',
            },
            watchers: {},
            targetOwner: ""
        }
    },
    computed: {
        userName: () => store.state.user.name,
        realRequestor: function () {
            return this.mode === 'Edit' ? this.uid2name(this.requestor) : this.userName;
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
        getDeadline() {
            let deadline = 0;
            if (this.deadlineText) {
                deadline = new Date(this.deadlineText + " 00:00:00").getTime();
            }
            return deadline;
        },
        get() {
            console.log('this.owner', this.owner)
            if (this.mode === 'Create') {
                console.log(this.owner, this.requestor);
                const ret = {
                    title: this.title,
                    description: this.description,
                    deadline: this.getDeadline(),
                    priority: this.priority,
                    selectedTags: this.selectedTags,
                    owner: this.owner,
                    status: this.status,
                    requestor: store.state.user.uid,
                    attachments: this.attachments,
                };
                ret.watchers = {};
                if (ret.owner) {
                    ret.watchers[ret.owner] = true;
                }
                if (ret.requestor) {
                    ret.watchers[ret.requestor] = true;
                }
                return ret;
            } else if (this.mode === 'Edit') {
                return ({
                    id: this.id,
                    title: this.title,
                    description: this.description,
                    deadline: this.getDeadline(),
                    priority: this.priority,
                    selectedTags: this.selectedTags,
                    requestor: this.requestor,
                    owner: this.owner,
                    status: this.status,
                    watchers: this.watchers,
                    attachments: this.attachments,
                });
            }
        },
        set(info) {
            if (!info.deadline) {
                info.deadline = '';
            }
            Object.assign(this, properties);
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
        fileUpload(e) {
            const getBase64 = (file) => {
                var reader = new FileReader();
                if (!file) {
                    return;
                }
                reader.readAsDataURL(file);
                reader.onload = () => {
                    socket.emit("upload", { id: this.id, data: reader.result, name: file.name }, (url) => {
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
    },
    components: {
        datepicker,
        'v-select': VueSelect,
        FileList
    }

}

</script>
