window.onload = function () {

    Vue.directive('loading', {
        bind: function (el, binding, vnode) {
            console.log(binding);
            vnode.context.$watch(binding.expression, function (object) {

                if (object.loading === undefined || object.loaded === undefined) {
                    element.addClass("loaded");
                    return;
                }

                if (object.loading === true) {
                    $loader = $('<div class="loader-wrapper"><div class="loader"><span>{</span><span>}</span></div></div>');
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
        update: function (el) { console.log(el); },
        componentUpdated: function (el) { console.log(el); },
        unbind: function () { }
    });
    const app = new Vue({
        el: "#form",
        data: {
            Text: "",
            Files: [],
            Errors: [],
            departmentId: 1,
            reasons: [],
            reasonId: 0,
            coordinates: []
        },
        methods: {
            InputFileValidate: function () {
                if (event.target.files.length > 5) {
                    this.Errors.push('Загружено слишком много файлов. Допускается не более 5');
                    $("#Files")[0].value = "";
                }
                var x = event.target.files;
                var re = /(?:\.([^.]+))?$/;

                for (i = 0; i < x.length; i++) {
                    app.Files[i] =  {
                        Extension: re.exec(x[i].name)[1],
                        Size: x[i].size,
                        UploadDate: new Date(),
                        Name: x[i].name.substr(0, x[i].name.lastIndexOf('.')) 
                    }
                }

                
                

   
            },
            init: function () {
                $.ajax({
                    url: "/application/GetReasonsByDepartment",
                    type: "POST",
                    async: false,
                    data: { Id: this.departmentId },
                    success: function (reasons) {
                        Vue.nextTick(function () {
                            app.reasons = [];
                            reasons.forEach(function (reason) {
                                app.reasons.push(reason);
                            });
                        });
                    }
                });
            },
            submit: function () {
                Vue.nextTick(function () {
                    app.coordinates = [];
                    myPlacemark.geometry._coordinates.forEach(function (coord) {
                        app.coordinates.push(coord);
                    });
                    console.log(app.Files);
                    $.ajax({
                        url: "/application/SubmitApplication",
                        type: "POST",
                        async: false,
                        data: {
                            Text: app.Text,
                            ReasonId: app.reasonId,
                            Longitude: app.coordinates[1], // сначала долгота... потому что
                            Latitude: app.coordinates[0],
                            Files: app.Files
                        }
                    });

                });

            },
            ajaxGetReasonsByDepartment: function () {
                $.ajax({
                    url: "/application/GetReasonsByDepartment",
                    type: "POST",
                    async: false,
                    data: { Id: this.departmentId },
                    success: function (reasons) {
                        Vue.nextTick(function () {
                            reasons.forEach(function (reason) {
                                app.reasons.push(reason);
                            });
                        });
                    }
                });
            }

        },
        beforeMount() {
            this.init();
        }

    });
};


   

