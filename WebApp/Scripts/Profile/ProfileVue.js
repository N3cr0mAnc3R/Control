const app = new Vue({
    el: "#userProfile",
    data: {
        applications: [],
        comment: '',
        img: '',
        commentImg: '',
        user: {},
        userImg: "/Content/Images/noImage.png",
        Files: [],
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
			changeApplicationText: function (applicationId, text) {
				$.ajax({
					url: "/profile/ChangeApplicationText",
					type: "POST",
					data: { ApplicationId: applicationId, Text: text },
					async: false,
					success: function () {
						app.changeEditingState(applicationId, false);
					}
				});
			},
			changeEditingState: function (applicationId, state) {
				let appl = app.applications.find(a => a.Id === applicationId);
				this.applicationText = appl.Text;
				app.$set(appl, 'isEditing', state);

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
                        application.isEditing = false;
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
        getUserInfo: function () {
            this.GetUserImage();
            var self = this;
            $.ajax({
                url: "/profile/getUserInfo",
                type: "POST",
                async: false,
                success: function (userInfo) {
                    var date = new Date(Number(userInfo.DateOfBirth.substr(userInfo.DateOfBirth.indexOf('(') + 1, userInfo.DateOfBirth.indexOf(')') - userInfo.DateOfBirth.indexOf('(') - 1)));
                    self.$set(self.user, 'DateOfBirth', date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate());
                    var today = new Date();

                    var age = today.getFullYear() - date.getFullYear();
                    var m = today.getMonth() - date.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    self.$set(self.user, 'Age', age);

						self.$set(self.user, 'Email', userInfo.Email);
						self.$set(self.user, 'FullName', userInfo.FullName);
					

						console.log(today.getFullYear());
						console.log(date.getFullYear());
						console.log(age);

						console.log(self.user);

						self.objForLoading.loading = false;
						self.objForLoading.loaded = true;
					}
				});

        },
        GetUserImage: function () {
            var self = this;
            $.ajax({
                url: "/profile/GetUserImage",
                type: "POST",
                async: false,
                success: function (img) {
                    if (img)
                        self.userImg = 'data:image/png;base64, ' + img;
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
                async: false,
                success: function (PosNegCount) {
                    application.likeStatus = (application.likeStatus === 1) ? 0 : 1;
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
                    application.likeStatus = (application.likeStatus === -1) ? 0 : -1;
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
							app.GetUserImageForComment(comment.UserId);
							comment.img = app.commentImg;
							comment.authorName = comment.AuthorName,
							comment.dateTimeOfCreation = comment.DateTimeOfCreation,
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
        InputFileValidate: function () {
            var x = event.target.files;
            var re = /(?:\.([^.]+))?$/;

            for (i = 0; i < x.length; i++) {
                x[i].Extension = re.exec(x[i].name)[1];
                x[i].UploadDate = new Date();
                x[i].Name = x[i].name.substr(0, x[i].name.lastIndexOf('.'));
                app.Files[i] = x[i];
            }
        },
        saveProfileChanges: function () {
            $.each(app.Files, function (i, file) {
                ajaxData.append('Files[' + i + ']', file);
            });
        }
    },

    beforeMount() {
        this.objForLoading.loading = true;
        this.objForLoading.loaded = false;
        this.selectApplicationsByUserId();
        this.getUserInfo();
    }



});

window.onload = function () {
    $('#userProfile').css('display', 'block');
    $('.sk-wave').css('display', 'none');
};