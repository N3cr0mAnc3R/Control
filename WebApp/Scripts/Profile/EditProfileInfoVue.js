window.onload = function () {
	const app = new Vue({
		el: "#app",
		data: {
			user: {},
			img: '/Content/Images/noImage.png',
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
						if(img)
						self.img = 'data:image/png;base64, ' + img;
						

					}
				});
			},
			imageSelectionHandler: function (event) {
				app.InputFileValidate();
				var reader = new FileReader();
				reader.onload = function () {

					app.img = reader.result;

				};
				reader.readAsDataURL(event.target.files[0]);
			},
			//дата не забирается
			getUserInfo: function () {
				this.GetUserImage();
				var self = this;
				$.ajax({
					url: "/profile/getUserInfo",
					type: "POST",
					async: false,
					success: function (userInfo) {
						console.log(userInfo);
						//if (userInfo.DateOfBirth !== 0)
							self.$set(self.user, 'DateOfBirth', new Date(userInfo.DateOfBirth));
						self.$set(self.user, 'Email', userInfo.Email);
						self.$set(self.user, 'FullName', userInfo.FullName);

					}
				});

			},
			//если даиа не выбрана, возникают проблемы
			changeUserInfo: function () {
				if (app.comment !== '') {
					$.ajax({
						url: "/profile/ChangeUserInfo",
						type: "POST",
						async: false,
						data: app.user,
						success: function () {
							console.log('heee');
						}
					}

					);
				}

			}




		},

		mounted() {
			this.objForLoading.loading = true;
			this.objForLoading.loaded = false;
			this.getUserInfo();
		}

	});
};