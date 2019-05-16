const app = new Vue({
    el: "#socialLoginForm",
    data: {
        Text: "",
        vkinfo: "",
        okinfo: ""
    },
    methods: {

        GetVkInfo: function () {
            $.ajax({
                url: "/Account/GetVkInfo",
                type: "POST",
                async: false,

                success: function (info) {
                    Vue.nextTick(function () {
                        app.vkinfo = info;
                        console.log(app.vkinfo);

                    });
                }
            });
        },

        GetOkInfo: function () {
            $.ajax({
                url: "/Account/GetOkInfo",
                type: "POST",
                async: false,
                //data: { code: "" },
                success: function (info) {
                    Vue.nextTick(function () {
                        app.okinfo = info;
                        console.log(app.okinfo);

                    });
                }
            });
        }

    },
    beforeMount() {
        var str = window.location.href;
        console.log();
        if (str.indexOf('AuthVk') === -1) {
            this.GetVkInfo();
            this.GetOkInfo();
        }
        else {
            var newstr = str.replace('#', '?');
            console.log(newstr);
            window.open(newstr, '_self');
        }
    }



});
