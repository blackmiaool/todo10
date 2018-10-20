<template>
    <div class="comp-filelist">
        <div :key="attachment" v-for="(attachment,key) in value">
            <section>

                <a :href="attachment.url" target="_blank">{{attachment | url2fileName}}</a>
                <div class="button-group">
                    <button v-if="attachment.type==='image'" class="btn btn-success btn-xs" @click="upload(attachment.url)" :title="$t('Upload and copy url')">
                        <i class="fa fa-upload"></i>
                    </button>
                    <a :href="attachment.url" class="btn btn-default btn-xs" download :title="$t('Download')">
                        <i class="fa fa-download"></i>
                    </a>
                    <button v-if="mode==='edit'" class="btn btn-danger btn-xs" @click="remove(key)" :title="$t('Delete')">
                        <i class="fa fa-remove"></i>
                    </button>
                </div>
                <div v-if="attachment.type==='image'" class="file-preview-img">
                    <a :href="attachment.url" target="_blank">
                        <img :src="attachment.url" alt="">
                    </a>
                </div>
            </section>

        </div>
    </div>
</template>

<script>
import socket from "../io";
export default {
    name: "FileList",
    created() {},

    mounted() {},
    props: ["value", "mode"],
    data() {
        return {};
    },
    computed: {},
    watch: {},
    methods: {
        showPreview(attachment) {
            return attachment && attachment.match(/jpeg|jpg|png|gif|svg$/);
        },
        upload(url) {
            if (url.match(/^\/\//)) {
                url = "http:" + url;
            }
            socket.emit("uploadUrl", url, result => {
                prompt("copy", result.data);
            });
        },
        remove(key) {
            this.value.splice(key, 1);
        }
    }
};
</script>
