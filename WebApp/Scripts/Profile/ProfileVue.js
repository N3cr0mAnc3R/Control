window.onload = function () {
	const app = new Vue({
		el: "#applications",
		data: {
			applications: [],
			comment: ''
		},
		methods: {
			toggleComments: function (Id) {
				let appl = this.applications.find(a => a.Id === Id);//обращение из заполненного заранее массива обращений...
				Vue.nextTick(function () {
					app.SelectCommentsByApplicationId(appl);

				});
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
				$.ajax({
					url: "/profile/SelectApplicationsByUserId",
					type: "POST",
					async: false,
					success: function (applications) {
						Vue.nextTick(function () {

							console.log(applications);
							applications.forEach(function (application) {
								application.IsOpened = false;
								application.currentCommentPageNumber = 1;
								app.applications.push(application);
							});
						});

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
							Vue.nextTick(function () {
								let applicationComments = [];
								obj.Comments.forEach(function (comment) {
									applicationComments.push(comment);
								});
								application.comments = applicationComments;
								application.IsOpened = !application.IsOpened;
								console.log(obj.CommentNumber);

								application.commentPagesNumber = parseInt(obj.CommentNumber / 10);

							});

						}
					});
				}
				else {
					application.IsOpened = !application.IsOpened;
				}
			}


		},
		changeCurrentCommentPageNumber: function () {
	
		},
        beforeMount() {
            this.selectApplicationsByUserId();
        }


    });
};