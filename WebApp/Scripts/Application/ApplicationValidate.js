Window.onload = function () {
    const app = new Vue({
        el: "#form",
        data: {
            Text: "11111",
            Files: [],
            Errors: []
        },
        methods: {
            InputFileValidate: function () {
                console.log(event.target.files);
            }
        }

    })
}