window.onload = function () {
    const app = new Vue({
        el: "#app",
        data: {
            user: {},
            img: '/Content/Images/noImage.png',
            Files: [],
            AnotherPicturePicked: false,
            objForLoading: {
                loading: false,
                loaded: true
            }

        },
        methods: {
            InputFileValidate: function () {

                var x = event.target.files;
                var re = /(?:\.([^.]+))?$/;

                for (i = 0; i < x.length; i++) {
                    x[i].Extension = re.exec(x[i].name)[1];
                    x[i].UploadDate = new Date();
                    x[i].Name = x[i].name.substr(0, x[i].name.lastIndexOf('.'));
                    app.Files[i] = x[i];
                    console.log(app.Files[i]);

                }

            },
            saveUserPhoto: function () {

                var ajaxData = new FormData();

                ajaxData.append('Files', $("#Files")[0].files[0]);
                //ajaxData.append('Files[0]',app.Files[0]);
                console.log(ajaxData);
                console.log(app.Files[0]);
                console.log($("#Files")[0].files[0]);

                $.ajax({
                    url: "/profile/FileUpload",
                    type: "POST",
                    async: false,
                    contentType: false,
                    processData: false,
                    data: ajaxData,
                    success: function () {
                        console.log('saveUserPhoto');
                    }
                });

            },
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
            imageSelectionHandler: function (event) {
                this.AnotherPicturePicked = true;
                app.InputFileValidate();
                var reader = new FileReader();
                reader.onload = function () {

                    app.img = reader.result;

                };
                reader.readAsDataURL(event.target.files[0]);
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
						var date = new Date(Number(userInfo.DateOfBirth.substr(userInfo.DateOfBirth.indexOf('(') + 1, userInfo.DateOfBirth.indexOf(')') - userInfo.DateOfBirth.indexOf('(') - 1)));

                        self.$set(self.user, 'DateOfBirth', date.getFullYear() + '-' + self.getTimeNumber(date.getMonth() + 1) + '-' + self.getTimeNumber(date.getDate()));
                        self.$set(self.user, 'Email', userInfo.Email);
                        self.$set(self.user, 'FullName', userInfo.FullName);
                        notifier([{Type: 'success', Body: 'Тестовое сообщение'}]);
                    }
                });

            },
            getTimeNumber: function (number) {
                if (number < 10)
                    return '0' + number;
                else return number;
            },
            //если даиа не выбрана, возникают проблемы
            changeUserInfo: function () {
                if (this.AnotherPicturePicked) {
                    app.saveUserPhoto();
                    AnotherPicturePicked = false;

                }


                $.ajax({
                    url: "/profile/ChangeUserInfo",
                    type: "POST",
                    async: false,
                    data: app.user,
                    success: function () {
                        console.log('heee');
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