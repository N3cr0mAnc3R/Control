const app = new Vue({
    el: "#home",
    data: {
        applications: [],
        comment: {
            text: '',
            img: '',
            parent: null
        },
        img: '',
        //commentImg: '',
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
        solved: 0,
        currentApplication: {},
        total: 0,
        HasTop: false,
        objForLoading: {
            loading: false,
            loaded: true
        }

    },
    methods: {
        toggleComments: function (Id) {
            let appl = this.applications.find(a => a.Id === Id);//обращение из заполненного заранее массива обращений...
            //appl.loading = false;
            //appl.loaded = true;

            if (!appl.IsOpened) {
                appl.IsOpened = !appl.IsOpened;
                app.$set(appl, 'loading', true);
                app.$set(appl, 'loaded', false);

                app.SelectCommentsByApplicationId(appl);
            }
            else {
                appl.IsOpened = !appl.IsOpened;
            }
            //appl.comments =app.SelectCommentsByApplicationId(appl.Id);//заполнение комметариев для данного обращения
        },
        addComment: function (applicationId) {
            if (app.comment.text !== '') {
                $.ajax({
                    url: "/profile/AddComment",
                    type: "POST",
                    async: false,
                    data: { ApplicationId: applicationId, Text: app.comment.text, ParentCommentId: app.comment.parent },
                    success: function () {
                        let appl = app.applications.find(a => a.Id === applicationId);
                        appl.IsOpened = false;//немного костыля  
                        //appl.currentCommentPageNumber = 1;//немного костыля  
                        self.ChangePageNumber(appl.currentCommentPageNumber);
                        app.comment.text = '';
                        app.comment.parent = null;
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
        //Получение информации о состоянии like/dislike
        GetApplicationLikeStatus: function (application) {
            var self = this;
            $.ajax({
                url: "/application/GetLikeDislike",
                type: "POST",
                data: { applicationId: application.Id },
                async: false,
                success: function (contribution) {
                    application.likeStatus = contribution;
                }
            });
        },
        //Получение количества like-ов/dislike-ов
        GetPosNegCount: function (application) {
            var self = this;
            $.ajax({
                url: "/application/GetPosNegCount",
                type: "POST",
                data: { applicationId: application.Id },
                async: false,
                success: function (PosNegCount) {
                    application.PosCount = PosNegCount.PosCount;
                    application.NegCount = PosNegCount.NegCount;
                }
            });
        },
        //Изменение статуса на Like
        Like: function (Id) {
            let application = this.applications.find(a => a.Id === Id);//обращение из заполненного заранее массива обращений...

            var self = this;
            $.ajax({
                url: "/application/Like",
                type: "POST",
                data: { applicationId: application.Id },
                async: false,
                success: function (PosNegCount) {
                    if (PosNegCount) {
                        application.likeStatus = (application.likeStatus === 1) ? 0 : 1;
                        application.PosCount = PosNegCount.PosCount;
                        application.NegCount = PosNegCount.NegCount;
                    }
                    else {
                        notifier([{ Type: 'error', Body: "Для выставления отметки нужно авторизоваться" }]);

                    }
                }
            });
        },
        //Изменение статуса на Dislike
        Dislike: function (Id) {
            let application = this.applications.find(a => a.Id === Id);
            var self = this;
            $.ajax({
                url: "/application/Dislike",
                type: "POST",
                data: { applicationId: application.Id },
                async: false,
                success: function (PosNegCount) {
                    if (PosNegCount) {
                        application.likeStatus = (application.likeStatus === -1) ? 0 : -1;
                        application.PosCount = PosNegCount.PosCount;
                        application.NegCount = PosNegCount.NegCount;

                    }
                    else {
                        notifier([{ Type: 'error', Body: "Для выставления отметки нужно авторизоваться" }]);

                    }
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
                async: false,
                success: function (applications) {
                    console.log(applications);
                    if (applications && applications.length > 0) {
                        applications.forEach(function (application) {
                            self.GetApplicationImages(application);
                            self.GetApplicationLikeStatus(application);
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
        GetUserImageForComment: function (comment) {
            var self = this;
            $.ajax({
                url: "/profile/GetUserImage",
                type: "POST",
                data: { UserId: comment.UserId },
                async: false,
                success: function (img) {
                    if (img)
                        comment.img = 'data:image/png;base64, ' + img;
                    console.log(comment);
                }
            });
        },
        ChangePageNumber: function (appId, offset) {

            let appl = app.applications.find(a => a.Id === appId);
            app.$set(appl, 'loading', true);
            app.$set(appl, 'loaded', false);
            this.SelectCommentsByApplicationId(appl, offset);
            //appl.comments = [];
            //$.ajax({
            //    url: "/profile/SelectCommentsByApplicationId",
            //    type: "POST",
            //    data: { ApplicationId: appl.Id, Offset: offset },
            //    async: false,
            //    success: function (obj) {
            //        let applicationComments = [];
            //        obj.Comments.forEach(function (comment) {
            //            applicationComments.push(comment);
            //        });
            //        app.$set(appl, 'comments', applicationComments);
            //        app.$set(appl, 'currentCommentPageNumber', offset);
            //        //app.$set(appl, 'commentPagesNumber', parseInt(obj.CommentNumber / 10));

            //    }
            //});
        },
        isShowAsPage: function (number, current, max) {
            if (number > current - 2 && number < current + 2 && number < max && number > 1) {
                return true;
            }
            else return false;
        },
        SelectCommentsByApplicationId: function (application, offset) {
            application.loading = true;
            application.loaded = false;
            $.ajax({
                url: "/profile/SelectCommentsByApplicationId",
                type: "POST",
                data: { ApplicationId: application.Id, Offset: offset },
                async: false,
                success: function (obj) {
                    let applicationComments = [];
                    let tempUsers = [];
                    obj.Comments.forEach(function (comment) {
                        if (tempUsers.indexOf(comment.UserId) === -1) {
                            app.GetUserImageForComment(comment);
                            tempUsers.push(comment.UserId);
                        }
                        else {
                            comment.img = applicationComments.find(a => a.UserId === comment.UserId).img;
                        }
                        //comment.img = app.commentImg;
                        //comment.authorName = comment.AuthorName;
                        var date = new Date(Number(comment.DateTimeOfCreation.substr(comment.DateTimeOfCreation.indexOf('(') + 1, comment.DateTimeOfCreation.indexOf(')') - comment.DateTimeOfCreation.indexOf('(') - 1)));
                        comment.dateTimeOfCreation = date.toLocaleString('Ru-ru');

                        applicationComments.push(comment);
                    });
                    app.$set(application, 'comments', applicationComments);


                    app.$set(application, 'commentPagesNumber', Math.ceil(parseFloat(obj.CommentNumber) / 5));
                    app.$set(application, 'currentCommentPageNumber', offset ? offset : 1);

                    //app.$set(application, 'loading', false);
                    //app.$set(application, 'loaded', true);
                    application.loading = false;
                    application.loaded = true;
                }
            });

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
        reply: function (comment) {
            console.log(this.comment);
            this.comment.parent = comment.Id;
            this.comment.text = comment.AuthorName + ', ';
            $('textarea').focus();
        },
        showInfoAboutApplication: function (Id) {
            let appl = this.applications.find(a => a.Id === Id);
            ymaps.geocode([appl.Latitude.replace(',', '.'), appl.Longitude.replace(',', '.')]).then(function (res) {
                var firstGeoObject = res.geoObjects.get(0);
                appl.Address = [firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(),
                firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
                ].filter(Boolean).join(', ');
            });
            this.currentApplication = appl;
            $('#currentModal').modal('show');
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
        addPlacemark: function (Id, title, coordinates) {
            let placemark = this.createPlacemark(coordinates);
            app.myPlacemarks.push(placemark);
            this.myMap.geoObjects.add(placemark);

            this.getAddress(placemark, title, coordinates);
            placemark.events.add('click', function () {
                app.showInfoAboutApplication(Id);
            });
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
                            self.addPlacemark(application.Id, application.Title, [application.Latitude.replace(',', '.'), application.Longitude.replace(',', '.')]);
                        });
                    }
                    app.objForLoading.loading = false;
                    app.objForLoading.loaded = true;
                }
            });
        }
    },
    beforeMount() {
        var self = this;
        self.objForLoading.loading = true;
        self.objForLoading.loaded = false;
        $.when($.ajax({
            url: "/profile/SelectApplications",
            type: "POST",
            async: true
        }), $.ajax({
            url: "/home/GetTopApplications",
            type: "POST",
            async: true
        }), $.ajax({
            url: "/application/GetApplicationStats",
            type: "POST",
            async: true
        })).then(function (resp1, resp2, resp3) {
            Vue.nextTick(function () {
                self.applications = [];
                if (resp1[0] && resp1[0].length > 0) {
                    resp1[0].forEach(function (application) {
                        self.GetApplicationImages(application);
                        application.IsOpened = false;
                        application.isEditing = false;
                        self.GetApplicationImages(application);
                        self.GetApplicationLikeStatus(application);
                        self.$set(application, 'loading', false);
                        self.$set(application, 'loaded', true);
                        application.currentCommentPageNumber = 1;
                        self.applications.push(application);
                    });
                }
                $('.sk-wave').css('display', 'none');
                $('#home').css('display', 'block');
                self.topApplications = resp2[0];
                if (self.topApplications.length > 0) {
                    self.HasTop = true;
                }
                self.solved = resp3[0].Solved;
                self.total = resp3[0].Total;

                self.objForLoading.loading = false;
                self.objForLoading.loaded = true;
            });
        });
    }
    //   ,
    //mounted() {

    //    //Снимаем базовый загрузчик
    //    $('.sk-wave').css('display', 'none');
    //    $('#home').css('display', 'block');
    //}
});