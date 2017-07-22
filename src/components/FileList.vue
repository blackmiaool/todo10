<template>
    <div class="comp-filelist">
        <div :key="attachment" v-for="(attachment,key) in value">
            <section>
                <button v-if="mode==='edit'" class="btn btn-danger btn-xs" @click="remove(key)">
                    <i class="fa fa-remove"></i>
                </button>
                <a :href="attachment" target="_blank">{{attachment | url2fileName}}</a>
                <div v-if="attachment.match(/jpg|png|gif|svg$/)" class="file-preview-img">
                    <img :src="attachment" alt="">
                </div>
            </section>
    
        </div>
    </div>
</template>

<script>

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
        remove: function (key) {
            this.value.splice(key, 1);
        }
    },


}

</script>
