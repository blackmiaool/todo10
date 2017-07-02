// origin: https://github.com/heatherbooker/vue-sticky-scroll/blob/master/stickyScroll.js
// changed some code

// if we are in node.js enviro, require vue
let Vue;
try {
    Vue = require('vue');
} catch (e) {
    if (window.Vue) {
        Vue = window.Vue;
    } else {
        console.warn("There's no vue in env, so the stick-scroll won't work.");
    }
    // no worries, in browser enviro Vue should already be global
}
const $ = require("jquery");
const vueStickyScroll = Vue.directive('sticky-scroll', {
    bind: function (el, binding) {
        //use browser MutationObserver object
        const observer = new MutationObserver(scrollToBottom);
        //looking for new children that will change the height
        const config = {
            childList: true
        };
        observer.observe(el, config);

        //need reference to this, otherwise 'this'=MutationObserver

        function animateScroll(duration) {
            const start = el.scrollTop;
            const end = el.scrollHeight;
            const change = end - start;
            const increment = 20;

            function easeInOut(currentTime, start, change, duration) {
                //by Robert Penner
                currentTime /= duration / 2;
                if (currentTime < 1) {
                    return change / 2 * currentTime * currentTime + start;
                }
                currentTime -= 1;
                return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
            }

            function animate(elapsedTime) {
                elapsedTime += increment;
                var position = easeInOut(elapsedTime, start, change, duration);
                el.scrollTop = position;

                if (elapsedTime < duration) {
                    setTimeout(function () {
                        animate(elapsedTime);
                    }, increment)
                }
            }
            animate(0);
        }

        const $el = $(el);

        function tryJump() {
            if ($el.height() + el.scrollTop > el.scrollHeight - 300) {
                el.scrollTop = el.scrollHeight;
            }
        }
        let firstRender = true;

        function scrollToBottom(e) {
            if (firstRender) {
                firstRender = false;
                setTimeout(function () {
                    el.scrollTop = el.scrollHeight;
                }, 300);
            }
            e.forEach(function (record) {
                record.addedNodes.forEach(function (newChild) {
                    $(newChild).find("img").on("load", function () {
                        setTimeout(function () {
                            tryJump();
                        }, 100);
                        //                        el.scrollTop = el.scrollHeight;
                    });
                });
            });
            //            console.log(heightSum, el.scrollTop + heightSum, el.scrollHeight)
            if (binding.arg === 'animate') {
                //default is 300
                const duration = Number(binding.expression) || 300;
                animateScroll(duration);
            } else {
                //default is jump to bottom
                tryJump();
                //                el.scrollTop = el.scrollHeight;
            }
        }
    }
});

// check whether we are in node.js enviro
try {
    module.exports = vueStickyScroll;
} catch (e) {
    // no worries, our directive will just be registered in browser
}
