window.onload = function () {
	const app = new Vue({
		el: "#app",
		data: {

			img: '',
			Files: [],
			objForLoading: {
				loading: false,
				loaded: true
			}

		},
		methods: {
			InputFileValidate: function () {
				var x = event.target.files;
				var re = /(?:\.([^.]+))?$/;

				for (i = 0; i < x.length; i++) {
					x[i].Extension = re.exec(x[i].name)[1];
					x[i].UploadDate = new Date();
					x[i].Name = x[i].name.substr(0, x[i].name.lastIndexOf('.'));
					app.Files[i] = x[i];
					console.log(app.Files[i]);

				}

			},
			saveProfileChanges: function () {

				var ajaxData = new FormData();

				ajaxData.append('Files', $("#Files")[0].files[0]);
				//ajaxData.append('Files[0]',app.Files[0]);
				console.log(ajaxData);
				console.log(app.Files[0]);
				console.log($("#Files")[0].files[0]);

				$.ajax({
					url: "/profile/FileUpload",
					type: "POST",
					async: false,
					contentType: false,
					processData: false,
					data: ajaxData,
					success: function () {
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

						app.img = 'data:image/png;base64, ' + img;
						console.log(app.img);

					}
				});
			}

		},


		beforeMount() {
			this.objForLoading.loading = true;
			this.objForLoading.loaded = false;


		}



	});
};