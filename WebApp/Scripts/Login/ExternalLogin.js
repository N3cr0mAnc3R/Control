const app = new Vue({
    el: "#socialLoginForm",
    data: {
        Text: "",
        vkinfo: "",
    },
    methods: {
        vklogin: function () {

        },

        GetVkVnfo() {
            $.ajax({
                url: "/Account/GetVkInfo",
                type: "GET",
                async: false,
               
                success: function (info) {
                    vkinfo = info;
                    });
                }
            });
        }


});
