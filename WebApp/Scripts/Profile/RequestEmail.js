//Вообще непонятный файл
window.onload = function () {
    const app = new Vue({
        el: "#app",
        data: {
            user: {},
            
            objForLoading: {
                loading: false,
                loaded: true
            }

        },
        methods: {
   
            GetUserImage: function () {
                var self = this;
                $.ajax({
                    url: "/profile/GetUserImage",
                    type: "POST",
                    async: false,
                    success: function (img) {
                        if (img)
                            self.img = 'data:image/png;base64, ' + img;


                    }
                });
            },
            //дата не забирается
            getUserInfo: function () {
                this.GetUserImage();
                var self = this;
                $.ajax({
                    url: "/profile/getUserInfo",
                    type: "POST",
                    async: false,
                    success: function (userInfo) {
                        var date = new Date(Number(userInfo.DateOfBirth.substr(userInfo.DateOfBirth.indexOf('(') + 1, 12)));

                        //self.$set(self.user, 'DateOfBirth', date.getFullYear() + '-' + self.getTimeNumber(date.getMonth() + 1) + '-' + self.getTimeNumber(date.getDate()));
                        self.$set(self.user, 'Email', userInfo.Email);

                        if (userInfo.FullName != "" && userInfo.FullName != null) {

                            self.$set(self.user, 'FullName', userInfo.FullName);
                        }
                        else {
                            self.$set(self.user, 'FullName', "гражданин");
                        }
                        

                    }
                });

            },
            //если даиа не выбрана, возникают проблемы
            changeUserInfo: function () {
                $.ajax({
                    url: "/profile/ChangeUserInfo",
                    type: "POST",
                    async: false,
                    data: app.user,
                    success: function () {
                        console.log(app.user.Email);
                    }
                }

                );
            }

        },

        mounted() {
            this.objForLoading.loading = true;
            this.objForLoading.loaded = false;
            this.getUserInfo();
        }

    });
};