﻿window.onload = function () {
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
						appl.currentCommentPageNumber = 1;//немного костыля  
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
								application.currentCommentPageNumber = 1;
                                self.applications.push(application);
                                
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
            }


        },

        beforeMount() {
            this.objForLoading.loading = true;
            this.objForLoading.loaded = false;
            this.selectApplicationsByUserId();

        }


    });
};