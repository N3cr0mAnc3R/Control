window.onload = function () {
    const app = new Vue({
        el: "#form",
        data: {
            Text: "11111",
            Files: [],
            Errors: [],
            departmentId: 1,
            reasons: [],
            reasonId: 0
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
                            reasons.forEach(function (reason) {
                                app.reasons.push(reason);
                            });
                        });
                    }
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