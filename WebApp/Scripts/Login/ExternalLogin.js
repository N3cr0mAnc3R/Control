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
        console.log(str.indexOf('token.do'));
        if (str.indexOf('code') > -1) {
            console.log(13);
            var code = str.substring(str.lastIndexOf('code') + 5);
            $.ajax({
                url: "/Account/GetOKTokenUrl",
                type: "post",
                async: false,
                data: { code: code },
                success: function (url) {
                    Vue.nextTick(function () {
                        console.log(url);
                        $.ajax({
                            url: url,
                            type: "post",
                            async: false,
                            success: function (text) {
                                Vue.nextTick(function () {
                                    console.log(text);

                                    $.ajax({
                                        url: '/account/GetOKUserInfo',
                                        type: "post",
                                        async: false,
                                        data: { access_token: text.access_token },
                                        success: function (finalUrl) {
                                            Vue.nextTick(function () {

                                                $.ajax({
                                                    url: finalUrl,
                                                    type: "post",
                                                    async: false,
                                                    success: function (values) {
                                                        Vue.nextTick(function () {
                                                            let uid = Number.parseInt(values.uid);
                                                            console.log(values.uid, uid, typeof uid);
                                                            $.ajax({
                                                                url: '/account/AuthThirdParty',
                                                                type: "get",
                                                                async: false,
                                                                data: {
                                                                    user_id: uid,
                                                                    provider: 'Odnoklassniki'
                                                                }
                                                            });

                                                        });
                                                    }
                                                });

                                            });
                                        }
                                    });

                                });
                            }
                        });
                    });
                }
            });
        }
        else if (str.indexOf('AuthVk') === -1) {
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
