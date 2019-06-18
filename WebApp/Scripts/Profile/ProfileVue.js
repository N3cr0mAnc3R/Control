const app = new Vue({
	el: "#userProfile",
	data: {
		applications: [],
		comment: {
			text: '',
			img: '',
			parent: null
		},
		img: '',
		user: {},
		userImg: "/Content/Images/noImage.png",
        Files: [],
        currentApplication: {},
		objForLoading: {
			loading: false,
			loaded: true
		}

	},
	methods: {
		//Раскрытие/закрытие комментариев
        toggleComments: function (Id) {
            let self = this;
            this.applications.forEach(function (appl) {
                if (appl.Id !== Id) {
                    appl.IsOpened = false;
                    self.comment = {
                        text: '',
                        img: '',
                        parent: null
                    };
                }
            });
			let appl = this.applications.find(a => a.Id === Id);//обращение из заполненного заранее массива обращений...
			app.SelectCommentsByApplicationId(appl);
			//appl.comments =app.SelectCommentsByApplicationId(appl.Id);//заполнение комметариев для данного обращения

		},
		//Добавление комментария
		addComment: function (applicationId) {
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
		//Редактирование заявки
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
		//функция для переключения возможности редактирования заявки
		changeEditingState: function (applicationId, state) {
			let appl = app.applications.find(a => a.Id === applicationId);
			this.applicationText = appl.Text;
			app.$set(appl, 'isEditing', state);

		},
		//Получение всех заявко, отправленных пользователем
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
		//Получение информации о пользователе
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



					self.objForLoading.loading = false;
					self.objForLoading.loaded = true;
				}
			});

		},
		//Получение аватарки пользователя
		GetUserImage: function () {
			var self = this;
			$.ajax({
				url: "/profile/GetUserImage",
				type: "POST",
				async: false,
				success: function (img) {
					if (img) {
						self.userImg = 'data:image/png;base64, ' + img;
					}
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

		//Перейти на другую страницу с комментариями
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
        openPhoto: function (application, img) {
            this.currentApplication = null;
            this.currentApplication = application;
            this.currentApplication.img = img;
            $('#photo').modal('show');
        },
        reply: function (appl, comment) {
            console.log(comment);
            this.comment.parent = comment.Id;
            this.comment.text = comment.AuthorName + ', ';
            $('textarea').focus();
        },
		//Открытие комментариев (загрузка)
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
		//Валидация файла
		InputFileValidate: function () {
			var x = event.target.files;
			var re = /(?:\.([^.]+))?$/;

			for (i = 0; i < x.length; i++) {
				x[i].Extension = re.exec(x[i].name)[1];
				x[i].UploadDate = new Date();
				x[i].Name = x[i].name.substr(0, x[i].name.lastIndexOf('.'));
				app.Files[i] = x[i];
			}
		}
	},

	beforeMount() {
		this.objForLoading.loading = true;
		this.objForLoading.loaded = false;
		this.selectApplicationsByUserId();
		this.getUserInfo();
	}



});
//Убираем загрузчик по зваершению загрузки страницы
window.onload = function () {
	$('#userProfile').css('display', 'block');
	$('.sk-wave').css('display', 'none');
};