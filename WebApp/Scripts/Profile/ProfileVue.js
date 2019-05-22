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
						appl.currentCommentPageNumber = 1;//немного костыля  
                        app.SelectCommentsByApplicationId(appl);
                    }
                }

                );




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
            selectApplicationsByUserId: function () {
				var self = this;
				self.applications = [];
                $.ajax({
                    url: "/profile/SelectApplicationsByUserId",
                    type: "POST",
                    async: false,
                    success: function (applications) {
                            applications.forEach(function (application) {
                                self.GetApplicationImages(application);
                                self.GetApplicationLikeStatus(application);
                                self.GetPosNegCount(application);                                
								application.IsOpened = false;
								application.currentCommentPageNumber = 1;
                                self.applications.push(application);
                                console.log(application)
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
            Like: function (Id) {
                let application = this.applications.find(a => a.Id === Id);//обращение из заполненного заранее массива обращений...
                
                var self = this;
                $.ajax({
                    url: "/application/Like",
                    type: "POST",
                    data: { applicationId: application.Id },
                    async: true,
                    success: function (PosNegCount) {
                        application.likeStatus = (application.likeStatus == 1) ? 0 : 1;
                        application.PosCount = PosNegCount.PosCount;
                        application.NegCount = PosNegCount.NegCount;
                        
                    }
                });
            },
            Dislike: function (Id) {
                let application = this.applications.find(a => a.Id === Id);
                var self = this;
                $.ajax({
                    url: "/application/Dislike",
                    type: "POST",
                    data: { applicationId: application.Id },
                    async: false,
                    success: function (PosNegCount) {
                        application.likeStatus = (application.likeStatus == -1) ? 0 : -1;
                        application.PosCount = PosNegCount.PosCount;
                        application.NegCount = PosNegCount.NegCount;
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