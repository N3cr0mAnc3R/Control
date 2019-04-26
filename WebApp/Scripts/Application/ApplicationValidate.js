window.onload = function () {
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
                console.log(event.target.files);
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
                    //внутри nextTick???
                    $.ajax({
                        url: "/application/SubmitApplication",
                        type: "POST",
                        async: false,
                        data: {
                            uid: "08c7a7f0-d942-494b-84fd-be4b4f98066a", //Тест Тестович
                            text: this.Text,
                            isActive: true, // Хардкод!!
                            posCount: 0, //  Хардкод!! И нужен ли?
                            negCount: 0, //  Хардкод!! И нужен ли?
                            reasonId: this.reasonId,
                            longitude: coordinates[1], // сначала долгота... потому что
                            latitude: coordinates[0]

                        },
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


   

