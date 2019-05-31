﻿const app = new Vue({
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
        //HouseText: "",
        myPlacemark: undefined,
        myMap: {},
        objForLoading: {
            loading: false,
            loaded: true
        }
    },
    methods: {
        InputFileValidate: function () {
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
            console.log("Validate:");
            console.log(app.Files);
        },
        init: function () {
            this.ajaxGetReasonsByDepartment();
        },

        submit: function () {
            console.log("Submit:");
            console.log(app.Files);
            Vue.nextTick(function () {
                if (app.isMap) {
                    app.coordinates = [];
                    app.myPlacemark.geometry._coordinates.forEach(function (coord) {
                        app.coordinates.push(coord);
                    });
                }
                app.AddressText = "" + app.CityText + " " + app.StreetText + /*" " + app.HouseText*/;
                var ajaxData = new FormData();
                ajaxData.append('Text', app.Text);
                ajaxData.append('Title', app.Title);
                ajaxData.append('ReasonId', app.reasonId);
                ajaxData.append('AddressText', app.AddressText);
                ajaxData.append('Longitude', app.coordinates[1]);
                ajaxData.append('Latitude', app.coordinates[0]);
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
                        if (response.uri === 'auth') {
                            window.open('/account/login', '_self');
                        }
                        else if (response.uri === 'similar') {
                            window.open('/application/SimilarApplication?Longitude=' + response.Longitude + '&Latitude=' + response.Latitude + '&ReasonId=' + response.ReasonId, '_self');
                        }
                        else {
                            window.open('/profile/userprofile', '_self');
                        }
                    }
                });

            });

        },
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
        initYmaps: function () {
            navigator.geolocation.getCurrentPosition(function (position) {
                app.changeAddress(event, [position.coords.latitude, position.coords.longitude]);
                app.myMap.setCenter([
                    position.coords.latitude,
                    position.coords.longitude
                ]);
                console.log(position.coords);
            });
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
            

            this.objForLoading.loading = false;
            this.objForLoading.loaded = true;
        },
        ajaxGetReasonsByDepartment: function () {
            this.objForLoading.loading = true;
            this.objForLoading.loaded = false;
            $.ajax({
                url: "/application/GetReasonsByDepartment",
                type: "POST",
                async: false,
                data: { Id: this.departmentId },
                success: function (reasons) {
                    Vue.nextTick(function () {
                        app.reasons = [];
                        reasons.forEach(function (reason) {
                            
                            app.reasons.push(reason);
                        });
                        app.objForLoading.loaded = true;
                        app.objForLoading.loading = false;
                    });
                }
            });
        },
        toggleMap: function () {
            if (this.myMap.events) {
                app.myPlacemark = undefined;
            }
            app.isMap = !app.isMap;
            if (app.isMap) {
                ymaps.ready(this.initYmaps);
            }


        }

    },
    mounted() {
        this.objForLoading.loading = true;
        this.objForLoading.loaded = false;
        this.init();


    }
});
window.onload = function () {
    $('#form').css('display', 'block');
    $('.sk-wave').css('display', 'none');
};