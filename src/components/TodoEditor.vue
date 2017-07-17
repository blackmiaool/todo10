<template>
    <div class="todo-editor">
        <div class="input-block">
            <label for="new-todo-title">
                <i class="fa fa-pencil"></i>
                Todo Title
            </label>
            <input type="text" id="new-todo-title" class="form-control" placeholder="Describe the task within a few words" v-model="title">
            <span class="id-detail">id:{{id}}</span>
        </div>
        <div class="input-block">
            <label for="new-todo-content">
                <i class="fa fa-paint-brush"></i>
                Todo Description
            </label>
            <textarea type="text" id="new-todo-content" class="form-control" placeholder="Write some details about the task" v-model="description"></textarea>
    
        </div>
        <div class="input-block">
            <label>
                <i class="fa fa-tags"></i>
                Tags
            </label>
            <div data-mode="Edit" class="selected-tags">
                <span :key="tag" v-for="tag in selectedTags" class="selected-tag clickable" @click="removeTag(tag)">{{tag}}</span>
            </div>
            <div data-mode="Edit" class="common-tags">
                <span :key="tag" v-for="tag in commonTags" class="common-tag clickable" @click="selectTag(tag)">{{tag}}</span>
            </div>
    
        </div>
        <div class="input-block">
            <label for="choose-priority">
                <i class="fa fa-bomb"></i>
                Priority
            </label>
            <select id="choose-priority" class="form-control" v-model="priority">
                <option value="verbose">{{priorityMap.verbose}}</option>
                <option value="normal">{{priorityMap.normal}}</option>
                <option value="warn">{{priorityMap.warn}}</option>
                <option value="danger">{{priorityMap.danger}}</option>
            </select>
    
        </div>
        <div class="input-block">
            <label for="choose-deadline">
                <i class="fa fa-calendar-o"></i>
                Deadline (not recommended)
            </label>
            <datepicker v-model="deadlineText"></datepicker>
    
        </div>
        <div class="input-block">
            <label for="choose-assigner">
                <i class="fa fa-user-o"></i>
                Requestor
            </label>
            <input readonly type="text" id="choose-requestor" class="form-control" v-model="realRequestor">
    
        </div>
        <div class="input-block">
            <label for="choose-owner">
                <i class="fa fa-user-circle-o"></i>
                Owner
            </label>
            <v-select :value.sync="targetOwner" :options="userList" placeholder="search..." :onChange="onSelectOwner">
            </v-select>
            <!--<input type="text" id="choose-owner" class="form-control" v-model="owner">-->
    
        </div>
    
    </div>
</template>

<script>
import $ from "jquery";
import datepicker from 'vue-date';
import store from 'store';
import VueSelect from "vue-select";
import socket from "../io";
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
}
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
                verbose: 'delay it as u want~',
                normal: 'do it when u have time.',
                warn: 'do it as soon as possible!',
                danger: 'do it right now!!!',
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
            console.log('onSelectOwner', owner)

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
                    requestor: store.state.user.uid
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
                    watchers: this.watchers
                });
            }
        },
        set(info) {
            console.log('set', JSON.stringify(info))
            if (!info.deadline) {
                info.deadline = '';
            }
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
        }
    },
    components: {
        datepicker,
        'v-select': VueSelect
    }

}

</script>
