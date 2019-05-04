window.onload = function () {
	const app = new Vue({
		el: "#applications",
		data: {
			applications: [],
			comments: [],
			comment:'re'

		},
		methods: {
			toggleComments: function (Id) {
				let appl = this.applications.find(a => a.Id === Id);//обращение из заполненного заранее массива обращений...
				Vue.nextTick(function () {
					appl.IsOpened = !appl.IsOpened;
					if (appl.IsOpened) {
						app.SelectCommentsByApplicationId(appl.Id);//заполнение комметариев для данного обращения
						console.log(app.comments);//!!!!!!!!!!!успеют ли прийти все комментарии
						
						
					}
				});
			},
			changeComment: function (event) {
				this.comment = event.target.value;
			},
			addComment: function () {
				$.ajax({
					url: "/profile/AddComment",
					type: "POST",
					async: false,
					data: { ApplicationId:2, Text:app.comment}
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
							//Просто я немного тупой. Всё работает....
							console.log(applications);
							applications.forEach(function (application) {
								application.IsOpened = false;
								app.applications.push(application);
							});
						});

					}
				});
			},
			SelectCommentsByApplicationId: function (ApplicationId) {
			
				$.ajax({
					url: "/profile/SelectCommentsByApplicationId",
					type: "POST",
					data: { ApplicationId: ApplicationId },
					async: false,
					success: function (comments) {
						Vue.nextTick(function () {		
							app.comments = [];
							comments.forEach(function (comment) {
								app.comments.push(comment);
							});

						});

					}
				});
			}


		},
		beforeMount() {
			this.selectApplicationsByUserId();
		}
		

	});
};