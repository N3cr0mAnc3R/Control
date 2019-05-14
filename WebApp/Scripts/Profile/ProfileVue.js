window.onload = function () {
    const app = new Vue({
        el: "#applications",
        data: {
            applications: [],
            comment: '',
            img: '',
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
                $.ajax({
                    url: "/profile/AddComment",
                    type: "POST",
                    async: false,
                    data: { ApplicationId: applicationId, Text: app.comment },
                    success: function () {
                        let appl = app.applications.find(a => a.Id === applicationId);
                        appl.IsOpened = false;//немного костыля  
                        app.SelectCommentsByApplicationId(appl);
                    }
                }

                );




            },
            selectApplicationsByUserId: function () {
                var self = this;
                $.ajax({
                    url: "/profile/SelectApplicationsByUserId",
                    type: "POST",
                    async: false,
                    success: function (applications) {
                            applications.forEach(function (application) {
                                self.GetApplicationImages(application);
                                application.IsOpened = false;
                                self.applications.push(application);
                                console.log(application);
                            });
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

            SelectCommentsByApplicationId: function (application, offset = 1) {
                if (!application.IsOpened) {
                    $.ajax({
                        url: "/profile/SelectCommentsByApplicationId",
                        type: "POST",
                        data: { ApplicationId: application.Id, Offset: offset },
                        async: false,
                        success: function (obj) {
                            let applicationComments = [];
                            obj.Comments.forEach(function (comment) {
                                applicationComments.push(comment);
                            });
                            app.$set(application, 'comments', applicationComments);
                            application.IsOpened = !application.IsOpened;
                            console.log(obj.CommentNumber);

                            app.$set(application, 'commentPagesNumber', parseInt(obj.CommentNumber / 10));
                            console.log("SelectCommentsByApplicationId");
                        }
                    });
                }
                else {
                    application.IsOpened = !application.IsOpened;
                }
            }


        },

        beforeMount() {
            this.objForLoading.loading = true;
            this.objForLoading.loaded = false;
            this.selectApplicationsByUserId();

        }


    });
};