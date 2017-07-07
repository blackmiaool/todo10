<template>
    <div class="todo-editor">
        <div class="input-block">
            <label for="new-todo-title">Todo Title</label>
            <input type="text" id="new-todo-title" class="form-control" placeholder="Describe the task within a few words" v-model="title">
        </div>
        <div class="input-block">
            <label for="new-todo-content">Todo Content</label>
            <textarea type="text" id="new-todo-content" class="form-control" placeholder="Write some details about the task" v-model="description"></textarea>
    
        </div>
        <div class="input-block">
            <label>Tags</label>
            <div data-mode="Edit" class="selected-tags">
                <span :key="tag" v-for="tag in selectedTags" class="selected-tag clickable" @click="removeTag(tag)">{{tag}}</span>
            </div>
            <div data-mode="Edit" class="common-tags">
                <span :key="tag" v-for="tag in commonTags" class="common-tag clickable" @click="selectTag(tag)">{{tag}}</span>
            </div>
    
        </div>
        <div class="input-block">
            <label for="choose-priority">Priority</label>
            <select id="choose-priority" class="form-control" v-model="priority">
                <option value="verbose">{{priorityMap.verbose}}</option>
                <option value="normal">{{priorityMap.normal}}</option>
                <option value="warn">{{priorityMap.warn}}</option>
                <option value="danger">{{priorityMap.danger}}</option>
            </select>
    
        </div>
        <div class="input-block">
            <label for="choose-deadline">Deadline (not recommended)</label>
            <datepicker v-model="deadlineText"></datepicker>
    
        </div>
        <div class="input-block">
            <label for="choose-assigner">Creator</label>
            <input readonly type="text" id="choose-creator" class="form-control" v-model="creator">
    
        </div>
        <div class="input-block">
            <label for="choose-assignee">Assignee</label>
            <input type="text" id="choose-assignee" class="form-control" v-model="assignee">
    
        </div>
    
    </div>
</template>

<script>
import $ from "jquery";
import datepicker from 'vue-date';

const properties = {
    title: "",
    description: "bc",
    creator: "",
    deadline: "",
    deadlineText: "",
    assignee: "",
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
                verbose: 'delay it as u want(~)',
                normal: 'do it when u have time(.)',
                warn: 'do it as soon as possible(!)',
                danger: 'do it right now(!!!)',
            },
        }
    },
    computed: {

    },
    props: ["change", 'mode'],
    watch: {
        deadline(v) {
            console.log('v', v);
            this.deadlineText = new Date(v).format("yyyy-MM-dd hh:mm:ss");
        }
    },
    methods: {
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
                deadline = new Date(this.deadlineText).getTime();
            }
            return deadline;
        },
        get() {
            if (this.mode === 'Create') {
                return ({
                    title: this.title,
                    content: this.content,
                    deadline: this.getDeadline(),
                    priority: this.priority,
                    selectedTags: this.selectedTags,
                    assignee: this.assignee,
                });
            } else if (this.mode === 'Edit') {
                return ({
                    title: this.title,
                    content: this.content,
                    deadline: this.getDeadline(),
                    priority: this.priority,
                    selectedTags: this.selectedTags,
                    assignee: this.assignee,
                });
            }
        },
        set(info) {
            Object.assign(this, info);
            this.preventEdit = true;
            setTimeout(() => {
                this.preventEdit = false;
            });
        }
    },
    components: {
        datepicker
    }

}

</script>
