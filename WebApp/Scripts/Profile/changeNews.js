
window.onload = function () {
    const app = new Vue({
        el: "#news",
        data: {
            newId: 0,
            news: {
                Text: '',
                Date: ''
            }
        },
        methods: {
            save: function () {
                var t = CKEDITOR.instances.news1.getData();
                if (!isNaN(this.newId)) {
                    if (app.datetime && t)//все поля заполнены 
                        $.ajax({
                            url: "/profile/AddNews",
                            type: "POST",
                            async: false,
                            data: { Text: t, DateTime: news.Date },

                            success: function () {
                            }
                        });
                }
                else {
                    if (app.datetime && t)//все поля заполнены 
                        $.ajax({
                            url: "/profile/ChangeNew",
                            type: "POST",
                            async: false,
                            data: { Text: t, DateTime: news.Date },

                            success: function () {
                            }
                        });
                }

            }
        },

        mounted() {

            CKEDITOR.replace('news1');
            let str = window.location.href;
            this.newId = Number.parseInt(str.substr(str.lastIndexOf('/') + 1));
            console.log(this.newId);
            if (!isNaN(this.newId)) {
                $.ajax({
                    url: "/profile/GetNewById",
                    type: "POST",
                    async: false,
                    data: { Id: this.newId },

                    success: function (n) {
                        this.news = n;
                        var date = new Date(Number(this.news.Date.substr(this.news.Date.indexOf('(') + 1, this.news.Date.indexOf(')') - this.news.Date.indexOf('(') - 1)));
                        console.log(date);
                        this.news.Date = date.toLocaleString('Ru-ru');
                        console.log(this.news.Date);
                        setTimeout(function () { var t = CKEDITOR.instances.news1.setData(n.Text); }, 1000);
                    }
                });
            }
        }



    });
    $('#news').css('display', 'block');
    $('.sk-wave').css('display', 'none');
};