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

				var ajaxData = new FormData();
console.log($("#Files")[0].files);
				ajaxData.append('Files', $("#Files")[0].files[0]);
				
				$.ajax({
					url: "/profile/FileUpload",
					type: "POST",
					async: false,
					data:  ajaxData ,
					success: function () {

					}
				}

				);

			}
		},

		beforeMount() {
			this.objForLoading.loading = true;
			this.objForLoading.loaded = false;


		}


	
	});
};