const app = new Vue({
    el: "#form",
    data: {
        Text: "",
        Title: "",
        Files: [],
        Errors: [],
        departmentId: 1,
        reasons: [],
        reasonId: 0,
        coordinates: [],
        isMap: false,
        AddressText: "",
        CityText: "",
        StreetText: "",
        HouseText: "",
        myPlacemark: undefined,
        myMap: {},
        objForLoading: {
            loading: false,
            loaded: true
        }
    },
    methods: {
        //Функция для проверки файлов и обработки
        InputFileValidate: function () {
            //Если больше 5 файлов, выбросить ошибку
            if (event.target.files.length > 5) {
                this.Errors.push('Загружено слишком много файлов. Допускается не более 5');
                $("#Files")[0].value = "";
            }
            var x = event.target.files;
            var re = /(?:\.([^.]+))?$/;

            for (i = 0; i < x.length; i++) {
                x[i].Extension = re.exec(x[i].name)[1];
                x[i].UploadDate = new Date();
                x[i].Name = x[i].name.substr(0, x[i].name.lastIndexOf('.'));
                app.Files[i] = x[i];

            }
        },
        init: function () {
            //подгрузка причин для первоначальной загрузки
            this.ajaxGetReasonsByDepartment();
        },
        //Отправка заявки на сервер
        submit: function () {
            //Если выбран способ записи адреса точкой на карте
            if (app.isMap) {
                app.coordinates = [];
                app.myPlacemark.geometry._coordinates.forEach(function (coord) {
                    app.coordinates.push(coord);
                });
            }
            //Если выбран способ записи адреса через форму, то склеиваем в строку
            app.AddressText = "" + app.CityText + " " + app.StreetText + " " + app.HouseText;
            //Для отправки на сервер используем формдата (из-за файлов)
            var ajaxData = new FormData();
            //По очереди добавляем свойства объекта в формдата
            ajaxData.append('Text', app.Text);
            ajaxData.append('Title', app.Title);
            ajaxData.append('ReasonId', app.reasonId);
            ajaxData.append('AddressText', app.AddressText);
            ajaxData.append('Longitude', app.coordinates[1]);
            ajaxData.append('Latitude', app.coordinates[0]);
            //Перебор всех файлов из модели vue в формдата
            $.each(app.Files, function (i, file) {
                ajaxData.append('Files[' + i + ']', file);
            });
            $.ajax({
                url: "/application/SubmitApplication",
                type: "POST",
                async: false,
                contentType: false,
                processData: false,
                data: ajaxData,
                success: function (response) {
                    //Если с сервера приходит ответ auth, это значит, что пользователь не авторизован. Заявка создаётся только для зарегистрированных пользователей
                    if (response.uri === 'auth') {
                        window.open('/account/login', '_self');
                    }
                    //Если есть похожие записи, то открываем страницу с этим записями для возможности прикрепления
                    else if (response.uri === 'similar') {
                        window.open('/application/SimilarApplication?Longitude=' + response.Longitude + '&Latitude=' + response.Latitude + '&ReasonId=' + response.ReasonId, '_self');
                    }
                        //Если пользователль авторизован, а похожих заявок нет, то просто открываем страницу в личном кабинете с заявками
                    else {
                        window.open('/profile/userprofile', '_self');
                    }
                }
            });
        },
        //Создание метки на яндекс картах
        changeAddress: function (e, coordinates) {
            var coords;
            if (!coordinates) {
                coords = e.get('coords');
            }
            else {
                coords = coordinates;
            }
            // Если метка уже создана – просто передвигаем ее.
            if (app.myPlacemark) {
                app.myPlacemark.geometry.setCoordinates(coords);

            }
            // Если нет – создаем.
            else {
                app.myPlacemark = this.createPlacemark(coords);
                this.myMap.geoObjects.add(app.myPlacemark);
                // Слушаем событие окончания перетаскивания на метке.
                app.myPlacemark.events.add('dragend', function () {
                    app.getAddress(app.myPlacemark.geometry.getCoordinates());
                });
            }
            this.getAddress(coords);
        },
        createPlacemark: function (coords) {
            return new ymaps.Placemark(coords, {
                iconCaption: 'поиск...'
            }, {
                    preset: 'islands#violetDotIconWithCaption',
                    draggable: true
                });
        },
        //Создание преемлимого вида адреса для отображения пользователю на картах
        getAddress: function (coords) {
            app.myPlacemark.properties.set('iconCaption', 'поиск...');
            ymaps.geocode(coords).then(function (res) {
                var firstGeoObject = res.geoObjects.get(0);

                app.myPlacemark.properties
                    .set({
                        // Формируем строку с данными об объекте.
                        iconCaption: [
                            // Название населенного пункта или вышестоящее административно-территориальное образование.
                            firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(),
                            // Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания.
                            firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
                        ].filter(Boolean).join(', '),
                        // В качестве контента балуна задаем строку с адресом объекта.
                        balloonContent: firstGeoObject.getAddressLine()
                    });
            });
        },
        //Инициализация карты
        initYmaps: function () {
            //Получение доступа к gps пользователя, чтобы задать координаты
            navigator.geolocation.getCurrentPosition(function (position) {
                app.changeAddress(event, [position.coords.latitude, position.coords.longitude]);
                app.myMap.setCenter([
                    position.coords.latitude,
                    position.coords.longitude
                ]);
                console.log(position.coords);
            });
            //Если пользователь отклонил запрос на получение позиции, то автоматически выставим центр в 1 корпусе СКФУ
            let coords = [45.043515, 41.961798];
            if (app.coordinates.length > 0) {
                coords = app.coordinates;
            }
            this.myMap = new ymaps.Map('map', {
                center: coords,
                zoom: 17
            },
                { searchControlProvider: 'yandex#search' });

            // Слушаем клик на карте.
            this.myMap.events.add('click', app.changeAddress);

            //Освобождаем загрузчик
            this.objForLoading.loading = false;
            this.objForLoading.loaded = true;
        },
        //Функция для получения возможных причин по идентификатору ведомства
        ajaxGetReasonsByDepartment: function () {
            this.objForLoading.loading = true;
            this.objForLoading.loaded = false;
            var self = this;
            $.ajax({
                url: "/application/GetReasonsByDepartment",
                type: "POST",
                async: false,
                data: { Id: this.departmentId },
                success: function (reasons) {
                    //Vue.nextTick(function () {
                    //Обнуление
                    self.reasons = [];
                    //Перезапись доступных причин 
                    //reasons.forEach(function (reason) {
                    //    self.reasons.push(reason);
                    self.reasons = reasons;
                    //});
                    //Освобождение загрузчика
                    self.objForLoading.loaded = true;
                    self.objForLoading.loading = false;
                    // });
                }
            });
        },
        //Функция переключения способа ввода адреса: карта/строка
        toggleMap: function () {
            //Если карта уже была выбрана ранее, а затем переключаем на ввод через форму, то убираем точку на яндекс-картах
            if (this.myMap.events) {
                app.myPlacemark = undefined;
            }
            app.isMap = !app.isMap;
            //Если выбрана карта, то инициализируем её
            if (app.isMap) {
                ymaps.ready(this.initYmaps);
            }


        }

    },
    //После полной загрузки скрипта инициализируем
    mounted() {
        this.objForLoading.loading = true;
        this.objForLoading.loaded = false;
        this.init();
    }
});
//Снимаем базовый загрузчик
window.onload = function () {
    $('#form').css('display', 'block');
    $('.sk-wave').css('display', 'none');
};