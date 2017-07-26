<template>
    <div class="comp-filelist">
        <div :key="attachment" v-for="(attachment,key) in value">
            <section>
                <button v-if="mode==='edit'" class="btn btn-danger btn-xs" @click="remove(key)">
                    <i class="fa fa-remove"></i>
                </button>
                <a :href="attachment" target="_blank">{{attachment | url2fileName}}</a>
                <div class="button-group">
                    <button class="btn btn-success btn-xs" @click="upload(attachment)">
                        <i class="fa fa-upload" :title="$t('Upload and copy url')"></i>
                    </button>
                    <a :href="attachment" class="btn btn-default btn-xs" download>
                        <i class="fa fa-download" :title="$t('Upload and copy url')"></i>
                    </a>
    
                </div>
                <div v-if="attachment.match(/jpeg|jpg|png|gif|svg$/)" class="file-preview-img">
                    <a :href="attachment" target="_blank">
                        <img :src="attachment" alt="">
                    </a>
                </div>
            </section>
    
        </div>
    </div>
</template>

<script>
import socket from "../io";
export default {
    name: 'FileList',
    created() {

    },

    mounted() {

    },
    props: ['value', 'mode'],
    data() {
        return {

        }
    },
    computed: {

    },
    watch: {

    },
    methods: {
        upload(url) {
            if (url.match(/^\/\//)) {
                url = 'http:' + url;
            }
            socket.emit('uploadUrl', url, (result) => {
                prompt("copy", result.data);
            });
        },
        remove(key) {
            this.value.splice(key, 1);
        }
    },


}

</script>
