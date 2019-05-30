window.onload = function () {
    const app = new Vue({
        el: "#app",
        data: {
            user: {},//Информация о пользователе
            img: '/Content/Images/noImage.png', // Аватарка пользователя
            Files: [],//Новая аватарка пользователя
            AnotherPicturePicked: false, // Флаг загрузки новой аватарки
            objForLoading: {//Загрузчик
                loading: false,
                loaded: true
            }

        },
        methods: {
            //Валидатор файлов
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
            //Загрузка аватарки на сервер
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
                    }
                });

            },
            //Получение аватарки пользователя
            GetUserImage: function () {
                var self = this;
                $.ajax({
                    url: "/profile/GetUserImage",
                    type: "POST",
                    async: false,
                    success: function (img) {
                        if (img) {
                            self.img = 'data:image/png;base64, ' + img; //Раскодирование из base64
                        }

                    }
                });
            },
            //Предпоказ аватарки после выбора из инпута
            imageSelectionHandler: function (event) {
                this.AnotherPicturePicked = true;
                app.InputFileValidate();
                var reader = new FileReader();
                reader.onload = function () {

                    app.img = reader.result;

                };
                reader.readAsDataURL(event.target.files[0]);
            },
            //Получение основной информации о пользователе. Делается через ajax, чтобы прикрутить реактивность
            getUserInfo: function () {
                this.GetUserImage();
                var self = this;
                $.ajax({
                    url: "/profile/getUserInfo",
                    type: "POST",
                    async: false,
                    success: function (userInfo) {
                        //Из Json-а получается формат \Date(123123123). Вырезаем только количество секунд и парсим в дату
						var date = new Date(Number(userInfo.DateOfBirth.substr(userInfo.DateOfBirth.indexOf('(') + 1, userInfo.DateOfBirth.indexOf(')') - userInfo.DateOfBirth.indexOf('(') - 1)));

                        //Представляем дату в читабельном для vue формате
                        self.$set(self.user, 'DateOfBirth', date.getFullYear() + '-' + self.getTimeNumber(date.getMonth() + 1) + '-' + self.getTimeNumber(date.getDate()));
                        self.$set(self.user, 'Email', userInfo.Email);
                        self.$set(self.user, 'FullName', userInfo.FullName);
                        //notifier([{Type: 'success', Body: 'Тестовое сообщение'}]);
                    }
                });

            },
            //После парсинга даты формат её стрёмный. Функция проверяет, однозначное ли число и добавляет 0 вначале, чтобы корректно отобразить дату
            getTimeNumber: function (number) {
                if (number < 10)
                    return '0' + number;
                else return number;
            },
            //Обновление информации
            changeUserInfo: function () {
                //Чтобы не загружать лишний раз одну и ту же фотографию, проверяем флаг
                if (this.AnotherPicturePicked) {
                    app.saveUserPhoto();
                    this.AnotherPicturePicked = false;

                }
                $.ajax({
                    url: "/profile/ChangeUserInfo",
                    type: "POST",
                    async: false,
                    data: app.user,
                    success: function () {
                    }
                });
            }
        },
        mounted() {
            this.objForLoading.loading = true;
            this.objForLoading.loaded = false;
            this.getUserInfo();
        }

    });
};