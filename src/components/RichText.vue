<template>
    <div>
        <div v-for="li in list">
            <RichSection v-for="section in li" :data="section.data" :type="section.type" />
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
function tokenMatch(content, matches) {
    const tokens = [];
    matches.forEach(function(v) {
        let result;
        while (1) {
            result = v.regexp.exec(content);
            if (!result) {
                break;
            }
            tokens.push({
                index: result.index,
                length: result[0].length,
                data: result[0],
                type: v.type,
            })
        }
    });
    tokens.sort(function(a1, a2) {
        return a1.index > a2.index ? 1 : -1;
    });
    let result = [];
    let lastIndex = 0;
    tokens.forEach(function(v, i) {
        if (v.index > lastIndex) {
            result.push({
                type: "span",
                data: content.slice(lastIndex, v.index)
            });
        }
        lastIndex = v.index + v.length;
        result.push({
            type: v.type,
            data: v.data
        });
    });
    if (tokens.length) {
        const lastToken = tokens[tokens.length - 1];
        if (lastToken.index + lastToken.length !== tokens.length) {
            result.push({
                type: "span",
                data: content.slice(lastToken.index + lastToken.length, content.length)
            });
        }
    } else {
        if (content) {
            result.push({
                type: "span",
                data: content
            });
        }
    }
    return result;
}
export default {
    name: 'TodoList',
    mounted() {

    },
    props: ['data'],
    data() {
        return {
        };
    },
    methods: {
        parse(text) {
            const ret = tokenMatch(text, [{
                regexp: /(http)?s?:?\/\/[^) ），。,]+/g,
                type: "a"
            }]);
            console.log('ret', ret);
            return ret;
            // text = text.split('');
            // return [{ is: "span", data: text }];
        }
    },
    computed: {
        list() {
            return this.data.split("\n").map((v) => this.parse(v));
        }
    }
};

Vue.component('RichSection', {
    name: 'message-section',
    render(createElement) {
        if (this.type === "span") {
            return createElement(
                this.type, this.data);
        }
        if (this.type === "a") {
            return createElement(
                this.type, { attrs: { href: this.data, target: '_blank', style: 'word-break: break-all;' } }, this.data);
        }
        return createElement(
            this.type, {
                attrs: {
                    data: this.data
                }
            }
        )
    },
    props: ['type', 'data']
});
</script>
