const app = new Vue({
	el: "#socialLoginForm",
	data: {
		Text: "",
		vkinfo: "",
		okinfo: ""
	},
	methods: {
        //Получение url для авторизации через ВКонтакте
        GetVkInfo: function () {
            $.ajax({
                url: "/Account/GetVkInfo",
                type: "POST",
                async: false,

				success: function (info) {
					Vue.nextTick(function () {
						app.vkinfo = info;
					});
				}
			});
		},
        //Получение url для авторизации через Одноклассники
        GetOkInfo: function () {
            $.ajax({
                url: "/Account/GetOkInfo",
                type: "POST",
                async: false,
                success: function (info) {
                    Vue.nextTick(function () {
                        app.okinfo = info;
                    });
                }
            });
        }

    },
    //На эту страницу мы попадаем при разных обстоятельствах
    beforeMount() {
         //Текущий url
        var str = window.location.href;
        //Если передаётся code (для одноклассников)
        if (str.indexOf('code') > -1) {
            //Получаем code
            var code = str.substring(str.lastIndexOf('code') + 5);
            //Используем code для формирования ссылки для получения токена
            $.ajax({
                url: "/Account/GetOKTokenUrl",
                type: "post",
                async: false,
                data: { code: code },
                success: function (url) {
                    Vue.nextTick(function () {
                        //Переходим по полученному url-у и получаем токен
                        $.ajax({
                            url: url,
                            type: "post",
                            async: false,
                            success: function (text) {
                                Vue.nextTick(function () {
                                    //Формируем ссылку с полученным токеном
                                    $.ajax({
                                        url: '/account/GetOKUserInfo',
                                        type: "post",
                                        async: false,
                                        data: { access_token: text.access_token },
                                        success: function (finalUrl) {
                                            Vue.nextTick(function () {
                                                //Отправляем запрос в ОК и получаем данные о пользователе
                                                $.ajax({
                                                    url: finalUrl,
                                                    type: "post",
                                                    async: false,
                                                    success: function (values) {
                                                        //Авторизуемся на сервере и сохраняем данные о пользователе
                                                        Vue.nextTick(function () {
                                                            let uid = Number.parseInt(values.uid);
                                                            console.log(values);
                                                            $.ajax({
                                                                url: '/account/AuthThirdParty',
                                                                type: "get",
                                                                async: false,
                                                                data: {
                                                                    user_id: uid,
                                                                    email: values.email,
                                                                    bday: values.birthday,
                                                                    name: values.name,
                                                                    provider: 'Odnoklassniki'
                                                                },
                                                                success: function () {
                                                                    window.open('/application/getapplication', '_self');
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
        //Если загружается в первый раз
        else if (str.indexOf('AuthVk') === -1) {
            this.GetVkInfo();
            this.GetOkInfo();
        }
            //Если авторизовались с помощью вк
        else {
            var newstr = str.replace('#', '?');
            //Меняем Символ # на знак ? и снова открываем эту же страницу
            window.open(newstr, '_self');
        }
    }



});
