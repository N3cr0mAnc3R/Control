﻿const app = new Vue({
	el: "#app",
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
		//Раскрытие/закрытие комментариев
		toggleComments: function (Id) {
			let appl = this.applications.find(a => a.Id === Id);//обращение из заполненного заранее массива обращений...
			app.SelectCommentsByApplicationId(appl);
			//appl.comments =app.SelectCommentsByApplicationId(appl.Id);//заполнение комметариев для данного обращения

		},
		//Опять странный байндинг
		changeComment: function (event) {//байндинг комментария с vue 
			this.comment = event.target.value;
		},
		//Добавление комментария
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
	
		
		//Получение заявки
		selectApplicationById: function () {
			var self = this;
			self.applications = [];
			$.ajax({
				url: "/profile/SelectApplicationById",
				type: "POST",
				async: false,
				data: { Id: 6 },
				success: function (application) {
					
						self.GetApplicationImages(application);
						self.GetApplicationLikeStatus(application);
						self.GetPosNegCount(application);
						application.IsOpened = true;
						application.isEditing = false;
						application.currentCommentPageNumber = 1;
						self.applications.push(application);
				

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

		//Получение аватарки автора комментария
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
		//Функция проверки, нужно ли показывать номер страницы с комментариями
		isShowAsPage: function (number, current, max) {
			if (number > current - 2 && number < current + 2 && number < max && number > 1) {
				return true;
			}
			else return false;
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
		
	},

	beforeMount() {
		this.objForLoading.loading = true;
		this.objForLoading.loaded = false;
		this.selectApplicationById();
		
	}



});
//Убираем загрузчик по зваершению загрузки страницы
window.onload = function () {
	$('#userProfile').css('display', 'block');
	$('.sk-wave').css('display', 'none');
};