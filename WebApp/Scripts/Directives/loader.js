//Директива для создания загрузчика на некоторых элементах страницы
Vue.directive('loader', {
    bind: function (el, binding, vnode) {
        var self = this;
        var element = $(el);//Сам компонент, на который нужно навесить загрузчик
        var $loader;
        //Добавляем вручную для него класс, чтобы спрятать
        element.addClass('loading-controller');
        let collection = element.attr('parent');
        if (collection) {
            vnode.context.$watch(collection, function (object) {
                vnode.context[element.attr('parent')].forEach(function (item) {
                    if (item.loading === undefined || item.loaded === undefined) {
                        //Если объект загружен, то отображаем его с помощью класса
                        //element.addClass("loaded");
                        element.addClass("loaded");
                        return;
                    }
                    if (item.loading === true) {
                        //element.removeClass("loaded");
                        element.css("display", "none");
                        $loader = $('<div class="sk-wave"><div class="sk-rect sk-rect-1"></div><div class="sk-rect sk-rect-2"></div><div class="sk-rect sk-rect-3"></div><div class="sk-rect sk-rect-4"></div><div class="sk-rect sk-rect-5"></div></div>');
                        //Добавляем лоадер вместо содержимого блока
                        element.after($loader);
                    }
                    else if ($loader !== undefined) {
                        //Убираем лоадер спустя 0.4 секунды с затуханием
                        $loader.fadeOut(400, function () {
                            element.addClass("loaded");
                            //element.css("display", "block");
                            $loader.remove();
                            $loader = undefined;
                        });
                    }

                    if (item.loaded) {
                        element.addClass("loaded");
                    }
                })
            }, {deep: true});
        }
        else
        //Следим за переменной, объявленной в качестве загрузчика
            vnode.context.$watch(binding.expression, function (object) {
            if (object.loading === undefined || object.loaded === undefined) {
                //Если объект загружен, то отображаем его с помощью класса
                //element.addClass("loaded");
                element.addClass("loaded");
                return;
            }
            if (object.loading === true) {
                //element.removeClass("loaded");
                element.css("display", "none");
                $loader = $('<div class="sk-wave"><div class="sk-rect sk-rect-1"></div><div class="sk-rect sk-rect-2"></div><div class="sk-rect sk-rect-3"></div><div class="sk-rect sk-rect-4"></div><div class="sk-rect sk-rect-5"></div></div>');
                //Добавляем лоадер вместо содержимого блока
                element.after($loader);
            }
            else if ($loader !== undefined) {
                //Убираем лоадер спустя 0.4 секунды с затуханием
                $loader.fadeOut(400, function () {
                    element.addClass("loaded");
                    //element.css("display", "block");
                    $loader.remove();
                    $loader = undefined;
                });
            }

            if (object.loaded) {
                element.addClass("loaded");
                element.css("display", "block");
            }
        }, { deep: true });
    },
    twoWay: true,
    params: ['parent'],
    inserted: function () { },
    update: function (el) { },
    componentUpdated: function (el) { },
    unbind: function () { }
});
