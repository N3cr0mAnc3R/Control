const app = new Vue({
    el: "#socialLoginForm",
    data: {
        Text: "",
        vkinfo: ""
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
