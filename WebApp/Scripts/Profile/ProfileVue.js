window.onload = function () {
	const app = new Vue({
		el: ".application",
		data: {
			isActive: false,
			buttonText: "Показать комментарии",
			applications: [],
			comments:[]

		},
		methods: {
			toggleComments: function () {
				this.isActive = !this.isActive;
				if (this.isActive) {
					this.buttonText = "Скрыть комментарии";
				}
				else
					this.buttonText = "Показать комментарии";

			},

			selectApplicationsByUserId: function () {
				$.ajax({
					url: "/profile/SelectApplicationsByUserId",
					type: "GET",
					async: false,
					success: function (applications) {
						Vue.nextTick(function () {
						
							console.log(applications);
							//applications.forEach(function (application) {
							//	app.applications.push(application);
							//});
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