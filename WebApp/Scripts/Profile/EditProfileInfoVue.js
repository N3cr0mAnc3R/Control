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
				}
			},
			saveProfileChanges: function () {
				console.log('1');
				var ajaxData = new FormData();
				$.each(app.Files, function (i, file) {
					ajaxData.append('Files[' + i + ']', file);
					console.log(app.Files);
				});
			},

			beforeMount() {
				this.objForLoading.loading = true;
				this.objForLoading.loaded = false;


			}


		}
	});
};