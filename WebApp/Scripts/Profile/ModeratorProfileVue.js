﻿
window.onload = function () {
    const app = new Vue({
        el: "#userProfile",
        data: {
            applications: [], //Заявки
            comment: {
                text: '',
                img: '',
                parent: null
            },
            user: {}, // Пользователь
            //userImg: "/Content/Images/noImage.png", //Кажется, бесполезно
            //Files: [], Тоже бесполезно
            statusFilter: 1, //текущий фильтр по статусу
            applicationStatuses: [], //Все доступные фильтры
            IsNewsShown: false, //Флаг переключателя заявки/новости
            datetime: '', //Дата и время новости 
            currentApplication: {},
            reasonId: 0,
            departmentId: 0,
            departments: [],
            reasons: [],
            news: [],
            isSelectReason: false,
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
                let self = this;
                if (self.comment.text.trim() !== '') {
                    $.ajax({
                        url: "/profile/AddComment",
                        type: "POST",
                        async: false,
                        data: { ApplicationId: applicationId, Text: app.comment.text, ParentCommentId: app.comment.parent },
                        success: function () {
                            let appl = app.applications.find(a => a.Id === applicationId);
                            self.ChangePageNumber(appl.Id, appl.currentCommentPageNumber);


                            self.comment.text = '';
                            self.comment.parent = null;
                        }
                    }

                    );
                }
            },
            //"Удаление" заявки
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
            //Получение списка всех заявок
            selectApplications: function () {

                var self = this;
                self.statusFilter = 0;
                self.applications = [];
                $.ajax({
                    url: "/profile/SelectApplicationsForAdmin",
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
            getStatus: function (Id) {
                return this.applicationStatuses.find(a => a.Id === Id).Name;
            },
            getStatusClass: function (Id) {
                switch (Id) {
                    case 1: return 'badge badge-pill badge-primary';
                    case 2: return 'badge badge-pill badge-secondary';
                    case 3: return 'badge badge-pill badge-danger';
                    case 4: return 'badge badge-pill badge-success';
                }
            },
            //Фильтрация сообщений по статусу
            selectApplicationsByStatusId: function (statusId) {
                console.log(statusId);
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
                        if (img) {
                            comment.img = 'data:image/png;base64, ' + img;
                        }
                    }
                });
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
                                    app.GetUserImageForComment(comment);
                                    tempUsers.push(comment.UserId);
                                }
                                else {
                                    comment.img = applicationComments.find(a => a.UserId === comment.UserId).img;
                                }
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
            //Преключить на вкладку "Новости"
            showNews: function () {
                app.IsNewsShown = true;
                let self = this;

                $.ajax({
                    url: "/home/ShowAllNews",
                    type: "POST",
                    async: false,
                    success: function (data) {
                        self.news = data;
                    }
                });
                //редактор для новостей со стилями
            },
            //Переключить на вкладку "Заявки" Непонятно, почему бы и не toggle
            showApplications: function () {
                app.IsNewsShown = false;
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
                });

            },
            openPhoto: function (application, img) {
                this.currentApplication = application;
                this.currentApplication.img = img;
                $('#photo').modal('show');
            },
            //Добавление новости
            addNews: function () {
                var t = CKEDITOR.instances.news1.getData();
                if (app.datetime && t)//все поля заполнены 
                    $.ajax({
                        url: "/profile/AddNews",
                        type: "POST",
                        async: false,
                        data: { Text: t, DateTime: app.datetime },

                        success: function () {
                        }
                    }

                    );

            },
            reReason: function (appl) {
                let self = this;
                self.currentApplication = appl;
                $.ajax({
                    url: "/application/SelectAllDepartments",
                    type: "POST",
                    async: false,
                    success: function (departments) {
                        self.departments = [];
                        self.departments = departments;
                $('#currentModal').modal('show');
                        var optionText, array = [], newString, maxChar = 40;
                        $('select').each(function () {
                            console.log($(this).find('option'));
                            $(this).find('option').each(function (i, e) {
                                $(e).attr('title', $(e).text());
                                optionText = $(e).text();
                                newString = '';
                                console.log(12323213);
                                if (optionText.length > maxChar) {
                                    array = optionText.split(' ');
                                    $.each(array, function (ind, ele) {
                                        newString += ele + ' ';
                                        if (ind > 0 && newString.length > maxChar) {
                                            $(e).text(newString);
                                            return false;
                                        }
                                    });

                                }
                            });
                        });
                    }
                });
            },
            selectReasons: function () {
                let self = this;
                console.log(self.departmentId);
                $.ajax({
                    url: "/application/GetReasonsByDepartment",
                    type: "POST",
                    async: false,
                    data: { Id: self.departmentId },
                    success: function (reasons) {
                        self.reasons = [];
                        self.isSelectReason = true;
                        self.reasons = reasons;
                    }
                });
            },
            saveReason: function () {
                let self = this;
                $.ajax({
                    url: "/application/changeReason",
                    type: "POST",
                    async: false,
                    data: { applicationId: self.currentApplication.Id, ReasonId: self.reasonId },
                    success: function (text) {
                        notifier([{ Type: 'success', Body: text }]);
                        $('#currentModal').modal('hide');
                        self.selectApplications();
                    }
                });
            }
        },

        mounted() {
            this.selectApplications();
            this.getApplicationStatuses();
        }



    });
    $('#userProfile').css('display', 'block');
    $('.sk-wave').css('display', 'none');
};