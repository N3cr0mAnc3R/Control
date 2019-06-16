window.onload = function () {
    const app = new Vue({
        el: "#profile",
        data: {
            applications: [], //Заявки
            comment: {
                text: '',
                img: '',
                parent: null
            },
            commentImg: '', //Аватарка пользователя
            user: {}, // Пользователь
            statusFilter: 1, //текущий фильтр по статусу
            applicationStatuses: [], //Все доступные фильтры
            objForLoading: {
                loading: false,
                loaded: true
            }

        },
        methods: {
            //Открытие комментариев у заявки
            toggleComments: function (Id) {
                let appl = this.applications.find(a => a.Id === Id);//обращение из заполненного заранее массива обращений...
                app.SelectCommentsByApplicationId(appl);
                //appl.comments =app.SelectCommentsByApplicationId(appl.Id);//заполнение комметариев для данного обращения

            },
            //Добавление комментария и занесение в базу
            addComment: function (applicationId) {
                //Если не состоит из пробелов
                if (app.comment.trim() !== '') {
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
                    });
                }
            },
            //Получение списка всех заявок
            selectApplications: function () {

                var self = this;
                self.statusFilter = 0;
                self.applications = [];
                $.ajax({
                    url: "/profile/SelectApplications",
                    type: "POST",
                    async: false,
                    success: function (applications) {
                        applications.forEach(function (application) {
                            self.GetApplicationImages(application);
                            application.IsOpened = false;
                            application.isEditing = false;
                            application.currentCommentPageNumber = 1;
                            self.applications.push(application);
                        });

                        self.objForLoading.loading = false;
                        self.objForLoading.loaded = true;
                    }
                });
            },
            //Фильтрация сообщений по статусу
            selectApplicationsByStatusId: function (statusId) {
                app.statusFilter = statusId;
                var self = this;
                self.applications = [];
                $.ajax({
                    url: "/profile/SelectApplicationsByStatusId",
                    type: "POST",
                    data: { StatusId: statusId },
                    async: false,
                    success: function (applications) {
                        applications.forEach(function (application) {
                            self.GetApplicationImages(application);
                            application.IsOpened = false;
                            application.isEditing = false;
                            application.currentCommentPageNumber = 1;
                            self.applications.push(application);
                        });

                        self.objForLoading.loading = false;
                        self.objForLoading.loaded = true;
                    }
                });
            },
            //Получение фотографий заявок
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

            //Получение аваторки пользователя комментария
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
                    }
                });
            },
            reply: function (comment) {
                this.comment.parent = comment.Id;
                this.comment.text = comment.AuthorName + ', ';
                $('textarea').focus();
            },
            //!!!!!!!!!!!!!!!!!!!!!!!!!!!

            //Переход на другую страницу с комментариями
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
                    let tempUsers = [];
                        obj.Comments.forEach(function (comment) {
                            if (tempUsers.indexOf(comment.UserId) === -1) {
                                app.GetUserImageForComment(comment);
                                tempUsers.push(comment.UserId);
                            }
                            else {
                                comment.img = applicationComments.find(a => a.UserId === comment.UserId).img;
                            }
                            var date = new Date(Number(comment.DateTimeOfCreation.substr(comment.DateTimeOfCreation.indexOf('(') + 1, comment.DateTimeOfCreation.indexOf(')') - comment.DateTimeOfCreation.indexOf('(') - 1)));
                            comment.dateTimeOfCreation = date.toLocaleString('Ru-ru');
                            comment.Children.forEach(function (item) {
                                var date = new Date(Number(item.DateTimeOfCreation.substr(item.DateTimeOfCreation.indexOf('(') + 1, item.DateTimeOfCreation.indexOf(')') - item.DateTimeOfCreation.indexOf('(') - 1)));
                                item.dateTimeOfCreation = date.toLocaleString('Ru-ru');
                            });
                            applicationComments.push(comment);
                        });
                        app.$set(appl, 'comments', applicationComments);
                        app.$set(appl, 'currentCommentPageNumber', offset);
                        //app.$set(appl, 'commentPagesNumber', parseInt(obj.CommentNumber / 10));

                    }
                });
            },
            //Функция проверки, нужно ли показывать номер страницы с комментариями
            isShowAsPage: function (number, current, max) {
                if (number > current - 2 && number < current + 2 && number < max && number > 1) {
                    return true;
                }
                else return false;
            },
            //Открытие комментариев (загрузка)
            //ToDo: Сравнить с ChangePageNumber
            SelectCommentsByApplicationId: function (application, offset) {
                if (!application.IsOpened) {
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
                                    self.GetUserImageForComment(comment);
                                    tempUsers.push(comment.UserId);
                                }
                                else {
                                    comment.img = applicationComments.find(a => a.UserId === comment.UserId).img;
                                }
                                var date = new Date(Number(comment.DateTimeOfCreation.substr(comment.DateTimeOfCreation.indexOf('(') + 1, comment.DateTimeOfCreation.indexOf(')') - comment.DateTimeOfCreation.indexOf('(') - 1)));
                                comment.dateTimeOfCreation = date.toLocaleString('Ru-ru');
                                comment.Children.forEach(function (item) {
                                    var date = new Date(Number(item.DateTimeOfCreation.substr(item.DateTimeOfCreation.indexOf('(') + 1, item.DateTimeOfCreation.indexOf(')') - item.DateTimeOfCreation.indexOf('(') - 1)));
                                    item.dateTimeOfCreation = date.toLocaleString('Ru-ru');
                                });

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

            //Отклонить заявку
            declineApplication: function (applicationId) {

                $.ajax({
                    url: "/profile/DeclineApplication",
                    type: "POST",
                    async: false,
                    data: { ApplicationId: applicationId },
                    success: function () {
                        let appl = app.applications.find(a => a.Id === applicationId);
                        appl.Status = 3;
                        if (app.statusFilter === 0) { app.selectApplications(); }
                        else
                            app.selectApplicationsByStatusId(app.statusFilter);
                    }
                });

            },
            //Принять к рассмотрению для отображения на главной странице
            acceptApplication: function (applicationId) {
                $.ajax({
                    url: "/profile/AcceptApplication",
                    type: "POST",
                    async: false,
                    data: { ApplicationId: applicationId },
                    success: function () {
                        let appl = app.applications.find(a => a.Id === applicationId);
                        appl.Status = 2;
                        if (app.statusFilter === 0) { app.selectApplications(); }
                        else
                            app.selectApplicationsByStatusId(app.statusFilter);
                    }
                });
            },
            //Получение словаря доступных статусов у сообщений для фильтрации
            getApplicationStatuses: function (applicationId) {
                var self = this;
                $.ajax({
                    url: "/profile/GetApplicationStatuses",
                    type: "POST",
                    async: false,
                    data: { ApplicationId: applicationId },
                    success: function (statuses) {
                        statuses.forEach(function (status) {

                            self.applicationStatuses.push(status);
                        });
                    }
                }

                );

            }

        },
        beforeMount() {
            this.objForLoading.loading = true;
            this.objForLoading.loaded = false;
            this.selectApplications();
            this.getApplicationStatuses();
        }
    });
};