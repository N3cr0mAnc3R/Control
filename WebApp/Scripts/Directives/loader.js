
Vue.directive('loader', {
    bind: function (el, binding, vnode) {
        var element = $(el);
        var $loader;
        element.addClass('loading-controller');
        vnode.context.$watch(binding.expression, function (object) {
            if (object.loading === undefined || object.loaded === undefined) {
                element.addClass("loaded");
                return;
            }
            if (object.loading === true) {
                $loader = $('<div class="sk-wave"><div class="sk-rect sk-rect-1"></div><div class="sk-rect sk-rect-2"></div><div class="sk-rect sk-rect-3"></div><div class="sk-rect sk-rect-4"></div><div class="sk-rect sk-rect-5"></div></div>');
                element.after($loader);
            }
            else if ($loader !== undefined) {
                $loader.fadeOut(400, function () {
                    element.addClass("loaded");
                    element.css("display", "block");
                    $loader.remove();
                    $loader = undefined;
                });
            }

            if (object.loaded) {
                element.addClass("loaded");
            }
        }, { deep: true });
    },
    twoWay: true,
    params: ['obj'],
    paramWatchers: {
        obj: function (val, old) {
            console.log(val, old);
        }
    },
    inserted: function () { },
    update: function (el) { },
    componentUpdated: function (el) {  },
    unbind: function () { }
});
