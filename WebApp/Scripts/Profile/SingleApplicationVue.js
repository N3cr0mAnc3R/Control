const app = new Vue({
    el: "#app",
    data: {
        appl: {},
        appId: 0,
        comment: {
            text: '',
            img: '',
            parent: null
        },
        img: '',
        openedImg: '',
        //user: {},
        //userImg: "/Content/Images/noImage.png",
        Files: [],
        objForLoading: {
            loading: false,
            loaded: true
        },
        commentLoader: {
            loading: undefined,
            loaded: undefined
        },
        error: false

    },
    methods: {
        //Добавление комментария
        addComment: function (applicationId) {
            let self = this;
            if (self.comment.text !== '') {
                $.ajax({
                    url: "/profile/AddComment",
                    type: "POST",
                    async: false,
                    data: { ApplicationId: applicationId, Text: app.comment.text, ParentCommentId: app.comment.parent },
                    success: function () {
                        //self.appl.IsOpened = false;//немного костыля  
                        //self.appl.currentCommentPageNumber = 1;//немного костыля  
                        self.ChangePageNumber(self.appl.currentCommentPageNumber);

                        self.comment.text = '';
                        self.comment.parent = null;
                    }
                }

                );
            }
        },

        //Получение заявки
        selectApplicationById: function () {
            var self = this;
            self.applications = [];
            $.ajax({
                url: "/profile/SelectApplicationById",
                type: "POST",
                async: false,
                data: { Id: self.appId },
                success: function (application) {
                    self.GetApplicationImages(application);
                    self.GetApplicationLikeStatus(application);
                    self.GetPosNegCount(application);
                    application.IsOpened = true;
                    //application.isEditing = false;
                    application.currentCommentPageNumber = 1;
                    //self.applications.push(application);
                    self.appl = application;
                    self.SelectComments();


                },
                error: function () {
                    self.error = true;
                }
            });
        },
        //Получение фотографий заявки
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

        //Получение аватарки автора комментария
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
        //изменение размеров окна ввода комментария
        addAutoResize: function () {
            document.querySelectorAll('[data-autoresize]').forEach(function (element) {
                element.style.boxSizing = 'border-box';
                var offset = element.offsetHeight - element.clientHeight;
                document.addEventListener('input', function (event) {
                    event.target.style.height = 'auto';
                    event.target.style.height = event.target.scrollHeight + offset + 'px';
                });
                element.removeAttribute('data-autoresize');
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
                    application.likeStatus = (application.likeStatus === 1) ? 0 : 1;
                    application.PosCount = PosNegCount.PosCount;
                    application.NegCount = PosNegCount.NegCount;

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
                    application.likeStatus = (application.likeStatus === -1) ? 0 : -1;
                    application.PosCount = PosNegCount.PosCount;
                    application.NegCount = PosNegCount.NegCount;
                }
            });
        },
        reply: function (comment) {
            this.comment.parent = comment.Id;
            this.comment.text = comment.AuthorName + ', ';
            $('textarea').focus();
        },

        //Перейти на другую страницу с комментариями
        ChangePageNumber: function (offset) {
            let self = this;
            self.commentLoader.loading = true;
            self.commentLoader.loaded = false;
            self.appl.comments = [];
            $.ajax({
                url: "/profile/SelectCommentsByApplicationId",
                type: "POST",
                data: { ApplicationId: self.appl.Id, Offset: offset },
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
                        var date = new Date(Number(comment.DateTimeOfCreation.substr(comment.DateTimeOfCreation.indexOf('(') + 1, comment.DateTimeOfCreation.indexOf(')') - comment.DateTimeOfCreation.indexOf('(') - 1)));
                        comment.dateTimeOfCreation = date.toLocaleString('Ru-ru');
                        comment.Children.forEach(function (item) {
                            var date = new Date(Number(item.DateTimeOfCreation.substr(item.DateTimeOfCreation.indexOf('(') + 1, item.DateTimeOfCreation.indexOf(')') - item.DateTimeOfCreation.indexOf('(') - 1)));
                            item.dateTimeOfCreation = date.toLocaleString('Ru-ru');
                        })
                        applicationComments.push(comment);
                    });
                    self.$set(self.appl, 'comments', applicationComments);
                    self.$set(self.appl, 'currentCommentPageNumber', offset);
                    //app.$set(appl, 'commentPagesNumber', parseInt(obj.CommentNumber / 10));

                    self.commentLoader.loading = false;
                    self.commentLoader.loaded = true;

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
        openPhoto: function (img) {
            this.openedImg = img;
            $('#photo').modal('show');
        },
        //Открытие комментариев (загрузка)
        SelectComments: function (offset) {
            let self = this;
            $.ajax({
                url: "/profile/SelectCommentsByApplicationId",
                type: "POST",
                data: { ApplicationId: self.appl.Id, Offset: offset },
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
                        //comment.img = app.commentImg;
                        var date = new Date(Number(comment.DateTimeOfCreation.substr(comment.DateTimeOfCreation.indexOf('(') + 1, comment.DateTimeOfCreation.indexOf(')') - comment.DateTimeOfCreation.indexOf('(') - 1)));
                        comment.dateTimeOfCreation = date.toLocaleString('Ru-ru');
                        comment.Children.forEach(function (item) {
                            var date = new Date(Number(item.DateTimeOfCreation.substr(item.DateTimeOfCreation.indexOf('(') + 1, item.DateTimeOfCreation.indexOf(')') - item.DateTimeOfCreation.indexOf('(') - 1)));
                            item.dateTimeOfCreation = date.toLocaleString('Ru-ru');
                        });
                        applicationComments.push(comment);
                    });
                    self.$set(self.appl, 'comments', applicationComments);


                    self.$set(self.appl, 'commentPagesNumber', Math.ceil(parseFloat(obj.CommentNumber) / 5));

                    self.commentLoader.loading = false;
                    self.commentLoader.loaded = true;
                }
            });
        }
    },

    beforeMount() {
        this.commentLoader.loading = true;
        this.commentLoader.loaded = false;
        var str = window.location.href;
        this.appId = Number.parseInt(str.substr(str.lastIndexOf('/') + 1));
        this.selectApplicationById();
        this.addAutoResize();
    }



});
//Убираем загрузчик по зваершению загрузки страницы
window.onload = function () {
    $('#app').css('display', 'block');
    $('.sk-wave').css('display', 'none');
};