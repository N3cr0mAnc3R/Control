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
                    //appl.comments =app.SelectCommentsByApplicationId(appl.Id);//заполнение комметариев для данного обращения

                });
            },
            changeComment: function (event) {
                this.comment = event.target.value;
            },
            addComment: function (applicationId) {
                $.ajax({
                    url: "/profile/AddComment",
                    type: "POST",
                    async: false,
                    data: { ApplicationId: applicationId, Text: app.comment }
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
                                app.applications.push(application);
                            });
                        });

                    }
                });
            },
            SelectCommentsByApplicationId: function (application) {
                if (!application.IsOpened) {
                    $.ajax({
                        url: "/profile/SelectCommentsByApplicationId",
                        type: "POST",
                        data: { ApplicationId: application.Id },
                        async: false,
                        success: function (comments) {
                            Vue.nextTick(function () {
                                let applicationComments = [];
                                comments.forEach(function (comment) {
                                    applicationComments.push(comment);
                                });
                                application.comments = applicationComments;
                                application.IsOpened = !application.IsOpened;
                            });

                        }
                    });
                }
                else {
                    application.IsOpened = !application.IsOpened;
                }
            }


        },
        beforeMount() {
            this.selectApplicationsByUserId();
        }


    });
};