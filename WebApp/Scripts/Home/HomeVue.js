﻿window.onload = function () {
	const app = new Vue({
		el: "#home",
		data: {
			applications: [],
			comment: '',
			img: '',
			commentImg: '',
			user: {},
			userImg: "/Content/Images/noImage.png",
			Files: [],
			statusFilter: 1,
			applicationStatuses: [],
			IsNewsShown: false,
			datetime: '',
			news: '',
			tabNumber: 1,
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
			changeTabNumber: function (number) {
				app.tabNumber = number;
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
							console.log(self.applications);
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
						console.log(self.news);
					}
				});
			},

			
			showNews: function () {
				app.IsNewsShown = true;

				
			},
			showApplications: function () {
				app.IsNewsShown = false;
			},
			getApplicationStatuses: function (applicationId) {
				var self = this;
				$.ajax({
					url: "/profile/GetApplicationStatuses",
					type: "POST",
					async: false,
					data: { ApplicationId: applicationId },
					success: function (statuses) {
						console.log(statuses);
						statuses.forEach(function (status) {

							self.applicationStatuses.push(status);
						});
					}
				}

				);

			},
			
		},




		beforeMount() {
			this.objForLoading.loading = true;
			this.objForLoading.loaded = false;
			this.selectApplications();
			this.getApplicationStatuses();
			this.getAllNews();
		}



	});
};