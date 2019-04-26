window.onload = function () {
    const app = new Vue({
        el: "#form",
        data: {
            Text: "11111",
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
            setCoordinates: function () {
               // coordinates = myPlacemark.geometry._coordinates;
                Vue.nextTick(function () {
                    app.coordinates = [];
                    myPlacemark.geometry._coordinates.forEach(function (coord) {
                        app.coordinates.push(coord);
                    });
                });
                console.log("Координаты маркера: " + myPlacemark.geometry._coordinates); 
                console.log("Тем временем в переменной Vue: " + coordinates);
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


   

