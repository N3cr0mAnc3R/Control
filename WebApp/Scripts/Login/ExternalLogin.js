const app = new Vue({
    el: "#socialLoginForm",
    data: {
        Text: "",
        vkinfo: "",
        okinfo: ""
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

                    });
                }
            });
        }

    GetOkVnfo: function () {
            $.ajax({
                url: "/Account/GetOkInfo",
                type: "POST",
                async: false,

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
            this.GetVkVnfo();
        }
        else {
            var newstr = str.replace('#', '?');
            console.log(newstr);
            window.open(newstr, '_self');
        }
    }



});
