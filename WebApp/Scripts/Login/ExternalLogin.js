const app = new Vue({
    el: "#socialLoginForm",
    data: {
        Text: "",
        vkinfo: "",
    },
    methods: {

        GetVkVnfo: function () {
            $.ajax({
                url: "/Account/GetVkInfo",
                type: "POST",
                async: false,

                success: function (info) {
                    Vue.nextTick(function () {
                        app.vkinfo = info;
                        console.log(app.vkinfo);

                    })
                }
            });
        }
    },
    beforeMount() {

        this.GetVkVnfo();

    }



});
