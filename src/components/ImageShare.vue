<template>
    <div class="comp-report-viewer">
        <header>
            {{$t("Share Image")}}
        </header>
        <main>
            <div>{{$t('Right click to copy')}}</div>
            <div id="sharing-image">
                <img :src="src" alt="" style="max-width: 100%;">
            </div>
    
        </main>
    
    </div>
</template>

<script>
import store from 'store';
import Clipboard from 'clipboard';

export default {
    name: 'ImageShare',
    computed: {
    },
    mounted() {
        var clipboard = new Clipboard('[data-clipboard-target="#sharing-image"]');
    },
    data() {
        return {
            selectingMap: {}
        }
    },
    props: ['src'],
    components: {
    }
}

</script>
