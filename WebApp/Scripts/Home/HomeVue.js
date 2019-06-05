const app = new Vue({
    el: "#home",
    data: {
        applications: [],
        comment: '',
        img: '',
        commentImg: '',
        user: {},
        userImg: "/Content/Images/noImage.png",
        Files: [],
        statusFilter: 1,
        applicationStatuses: [],
        tabNumber: 1,
        myMap: {},
        coordinates: [],
        myPlacemarks: [],
        datetime: '',
        news: '',
        objForLoading: {
            loading: false,
            loaded: true
        }

    },
    methods: {
        toggleComments: function (Id) {
            let appl = this.applications.find(a => a.Id === Id);//обращение из заполненного заранее массива обращений...
            app.SelectCommentsByApplicationId(appl);
            //appl.comments =app.SelectCommentsByApplicationId(appl.Id);//заполнение комметариев для данного обращения
        },
        changeComment: function (event) {//байндинг комментария с vue 
            this.comment = event.target.value;

        },
        addComment: function (applicationId) {
            if (app.comment !== '') {
                $.ajax({
                    url: "/profile/AddComment",
                    type: "POST",
                    async: false,
                    data: { ApplicationId: applicationId, Text: app.comment },
                    success: function () {
                        let appl = app.applications.find(a => a.Id === applicationId);
                        appl.IsOpened = false;//немного костыля  
                        appl.currentCommentPageNumber = 1;//немного костыля  
                        app.SelectCommentsByApplicationId(appl);
                        app.comment = '';
                    }
                }

                );
            }




        },
        deleteApplication: function (applicationId) {
            $.ajax({
                url: "/profile/DeleteApplication",
                type: "POST",
                data: { ApplicationId: applicationId },
                async: false,
                success: function () {
                    app.selectApplicationsByUserId();
                }
            });
        },
        selectApplications: function () {

            var self = this;
            self.statusFilter = 0;
            self.applications = [];
            $.ajax({
                url: "/profile/SelectApplications",
                type: "POST",
                async: true,
                success: function (applications) {
                    if (applications && applications.length > 0) {
                        applications.forEach(function (application) {
                            self.GetApplicationImages(application);
                            application.IsOpened = false;
                            application.isEditing = false;
                            application.currentCommentPageNumber = 1;
                            self.applications.push(application);
                        });
                    }
                    self.objForLoading.loading = false;
                    self.objForLoading.loaded = true;
                }
            });
        },
        GetApplicationImages: function (application) {
            var self = this;
            $.ajax({
                url: "/application/GetApplicationImages",
                type: "POST",
                data: { Id: application.Id },
                async: false,
                success: function (imgs) {
                    let applicationImgs = [];
                    imgs.forEach(function (img) {
                        applicationImgs.push('data:image/png;base64, ' + img);
                    });
                    self.$set(application, 'imgs', applicationImgs);

                }
            });
        },
        GetUserImageForComment: function (id) {
            var self = this;
            $.ajax({
                url: "/profile/GetUserImage",
                type: "POST",
                data: { UserId: id },
                async: false,
                success: function (img) {
                    if (img)
                        self.commentImg = 'data:image/png;base64, ' + img;
                }
            });
        },
        ChangePageNumber: function (appId, offset) {

            let appl = app.applications.find(a => a.Id === appId);
            appl.comments = [];
            $.ajax({
                url: "/profile/SelectCommentsByApplicationId",
                type: "POST",
                data: { ApplicationId: appl.Id, Offset: offset },
                async: false,
                success: function (obj) {
                    let applicationComments = [];
                    obj.Comments.forEach(function (comment) {
                        applicationComments.push(comment);
                    });
                    app.$set(appl, 'comments', applicationComments);
                    app.$set(appl, 'currentCommentPageNumber', offset);
                    //app.$set(appl, 'commentPagesNumber', parseInt(obj.CommentNumber / 10));

                }
            });
        },
        isShowAsPage: function (number, current, max) {
            if (number > current - 2 && number < current + 2 && number < max && number > 1) {
                return true;
            }
            else return false;
        },
        SelectCommentsByApplicationId: function (application, offset) {
            if (!application.IsOpened) {
                $.ajax({
                    url: "/profile/SelectCommentsByApplicationId",
                    type: "POST",
                    data: { ApplicationId: application.Id, Offset: offset },
                    async: false,
                    success: function (obj) {
                        let applicationComments = [];
                        obj.Comments.forEach(function (comment) {

                            app.GetUserImageForComment(comment.UserId);
                            comment.img = app.commentImg;
                            comment.authorName = comment.AuthorName;
                            var date = new Date(Number(comment.DateTimeOfCreation.substr(comment.DateTimeOfCreation.indexOf('(') + 1, comment.DateTimeOfCreation.indexOf(')') - comment.DateTimeOfCreation.indexOf('(') - 1)));
                            comment.dateTimeOfCreation = date.toLocaleString('Ru-ru');


                            applicationComments.push(comment);
                        });
                        app.$set(application, 'comments', applicationComments);
                        application.IsOpened = !application.IsOpened;


                        app.$set(application, 'commentPagesNumber', Math.ceil(parseFloat(obj.CommentNumber) / 5));

                    }
                });
            }
            else {
                application.IsOpened = !application.IsOpened;
            }
        },
        getAllNews: function () {

            var self = this;
            $.ajax({
                url: "/home/ShowAllNews",
                type: "POST",
                async: false,
                success: function (nn) {
                    let news = [];
                    nn.forEach(function (n) {
                        news.push(n);
                    });
                    self.news = news;

                    self.objForLoading.loading = false;
                    self.objForLoading.loaded = true;
                }
            });
        },
        changeTabNumber: function (tab) {
            this.tabNumber = tab;
            this.objForLoading.loading = true;
            this.objForLoading.loaded = false;
            if (tab === 1) {
                this.selectApplications();
            }
            else if (tab === 2) {
                this.getAllNews();
            }
            else if (tab === 3) {
                ymaps.ready(this.initYmaps);
            }
        },
        getAddress: function (placemark, title, coords) {
            placemark.properties.set('iconCaption', 'поиск...');
            ymaps.geocode(coords).then(function (res) {
                var firstGeoObject = res.geoObjects.get(0);

                placemark.properties
                    .set({
                        // Формируем строку с данными об объекте.
                        iconCaption: title,
                        // В качестве контента балуна задаем строку с адресом объекта.
                        balloonContent: firstGeoObject.getAddressLine()
                    });
            });
        },
        //Создание метки на яндекс картах
        addPlacemark: function (title, coordinates) {
            let placemark = this.createPlacemark(coordinates);
            app.myPlacemarks.push(placemark);
            this.myMap.geoObjects.add(placemark);

            this.getAddress(placemark, title, coordinates);
        },
        createPlacemark: function (coords) {
            return new ymaps.Placemark(coords, {
                iconCaption: 'поиск...'
            }, {
                    preset: 'islands#violetDotIconWithCaption',
                    draggable: false
                });
        },
        initYmaps: function () {
            var self = this;
            //Получение доступа к gps пользователя, чтобы задать координаты
            navigator.geolocation.getCurrentPosition(function (position) {
                app.myMap.setCenter([
                    position.coords.latitude,
                    position.coords.longitude
                ]);
            });
            //Если пользователь отклонил запрос на получение позиции, то автоматически выставим центр в 1 корпусе СКФУ
            let coords = [45.043515, 41.961798];
            if (app.coordinates.length > 0) {
                coords = app.coordinates;
            }
            this.myMap = new ymaps.Map('map', {
                center: coords,
                zoom: 12
            },
                { searchControlProvider: 'yandex#search' });
            $.ajax({
                url: "/home/GetApplicationsWithCoords",
                type: "POST",
                async: true,
                success: function (applications) {
                    if (applications && applications.length > 0) {
                        applications.forEach(function (application) {
                            self.addPlacemark(application.Title, [application.Latitude.replace(',', '.'), application.Longitude.replace(',', '.')]);
                        });
                    }
                    app.objForLoading.loading = false;
                    app.objForLoading.loaded = true;
                }
            });
        }
    },
    beforeMount() {
        this.objForLoading.loading = undefined;
        this.objForLoading.loaded = undefined;
        this.selectApplications();
    },
    mounted() {

        //Снимаем базовый загрузчик
        $('.sk-wave').css('display', 'none');
        $('#home').css('display', 'block');
    }
});