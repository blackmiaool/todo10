<template>
    <div class="comp-report-viewer">
        <header>
            {{$t("Generate Report")}}
            <button class="btn btn-primary" data-clipboard-target="#report-content">{{$t('Copy')}}</button>
        </header>
        <main>
            <div class="to-copy" contenteditable="contenteditable" id="report-content">
                <h5 style="color:green;font-size:18px;margin:0px;margin-left: 28px;">【本周进展】</h5>
                <ul>
                    <li v-for="li in list[1]" :key="li.id">
                        <ReportItem :li="li" attachHref></ReportItem>
                    </li>
                </ul>
                <br>
                <h5 style="color:red;font-size:18px;margin:0px;margin-left: 28px;">【下周计划】</h5>
                <ul>
                    <li v-for="li in list[0]" :key="li.id" v-if="selectingMap[li.id]">
                        <ReportItem :li="li" @select="onSelect(li)" attachHref></ReportItem>
                    </li>
                </ul>
            </div>
            <div class="to-select">
    
                <ul>
                    <li v-for="li in list[0]" :key="li.id" v-if="!selectingMap[li.id]">
                        <ReportItem :li="li" @select="onSelect(li)"></ReportItem>
                    </li>
                </ul>
            </div>
    
        </main>
    
    </div>
</template>

<script>
import store from 'store';
import ReportItem from 'components/ReportItem';
import Clipboard from 'clipboard';
function list2html(list) {
    return list;
}
export default {
    name: 'ReportViewer',
    computed: {
        html() {
            return list2html(this.list);
        }
    },
    mounted() {
        var clipboard = new Clipboard('[data-clipboard-target="#report-content"]');
    },
    data() {
        return {
            selectingMap: {}
        }
    },
    methods: {
        projectInfo: (id) => console.log(id) || store.getters.projectInfo(id),
        tagInfo: (id) => store.getters.tagInfo(id),
        onSelect(li) {
            if (this.selectingMap[li.id]) {
                this.$delete(this.selectingMap, li.id);
            } else {
                this.$set(this.selectingMap, li.id, true)
            }

            // this.selectingMap[li.id] = true;
            // console.log('onSelect', this.selectingMap);
        }
    },
    props: ['list'],
    components: {
        ReportItem
    }
}

</script>
