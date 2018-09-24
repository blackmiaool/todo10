<template>
    <div @click="$emit('select',li)">
        <div class="title" style="display:inline-block;">
            <a :href="href" target="_blank" style="cursor:pointer;" @click="prevent">
                <span :style="titleStyle">{{li.title}}</span>
            </a>
            <span class="project" v-for="project in li.projects" :key="project" :style="projectStyle">{{projectInfo(project).name}}</span>
            <span class="tag" v-for="tag in li.tags" :key="tag" :style="tagStyle">{{tagInfo(tag).name}}</span>
        </div>
        <div>
            <span class="relation">
                {{requestorName}} -> {{ownerName}}
            </span>
        </div>
    </div>
</template>

<script>
import store from "store";
export default {
    name: "ReportViewer",
    computed: {
        requestorName: function() {
            return store.getters.uid2name(this.li.requestor);
        },
        ownerName: function() {
            return store.getters.uid2name(this.li.owner);
        },
        href() {
            if (this.attachHref !== undefined) {
                return location.origin + "/#/view?id=" + this.li.id;
            } else {
                return undefined;
            }
        }
    },
    methods: {
        prevent(e) {
            e.preventDefault();
        },
        projectInfo: id => store.getters.projectInfo(id),
        tagInfo: id => store.getters.tagInfo(id)
    },
    props: ["li", "attachHref"],
    data() {
        return {
            titleStyle: `
            font-size:20px;
            `,
            projectStyle: `
            padding: 3px 6px;
            font-size: 15px;
            line-height: 16px;
            background-color: #5cb85c;
            color: white;
            margin-right:2px;
            `,
            tagStyle: `
            font-size:12px;
            line-height:12px;            
            border: 1px solid #5cb85c;
            color: #5cb85c;
            border-radius: 100px;
            padding: 3px 10px;
            margin-right: 5px;
            `
        };
    }
};
</script>
