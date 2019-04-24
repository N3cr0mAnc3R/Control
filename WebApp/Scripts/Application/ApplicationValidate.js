window.onload = function () {
    const app = new Vue({
        el: "#form",
        data: {
            Text: "11111",
            Files: [],
            Errors: []
        },
        methods: {
            InputFileValidate: function () {
                if (event.target.files.length > 5) {
                    this.Errors.push('Загружено слишком много файлов. Допускается не более 5');
                    $("#Files")[0].value = "";
                }
                console.log(event.target.files);
            }
        }

    })
}