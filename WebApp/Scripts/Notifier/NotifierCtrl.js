var loaded = true,
    removeDelay = 5000,
    lastIndex = 0;
    notifierScope = {
        messages: [],
        clear: function () {
            var self = this;
            self.messages = [];
        }
    };
function findLastChild(elem) {
    var finded = elem;
    var children = $(finded).children();
    if (children.length > 0 && !$(finded).hasClass('kernel-system-notifications-wrapper')) {
        finded = findLastChild(children.last());
    }
    return finded;
}
function notifier(incomeMessages) {
    if (incomeMessages instanceof Array) {
        var fullWrapper = $('#notification-wrapper');
        incomeMessages.forEach(function (message, index) {
            lastIndex++;
            var messageWrapper = {
                source: message,
                remove: function () {
                    var self = this;
                    var index = notifierScope.messages.indexOf(self);

                    if (index !== -1) {
                        notifierScope.messages.splice(index, 1);
                    }
                    $('#index-' + self.index).fadeOut('slow', function () {
                        $('#index-' + self.index).remove();
                        if (notifierScope.messages.length === 0) {
                            $('.kernel-system').css('display', 'none');
                        }
                    });
                },
                class: [
                    "delay-" + (index + 1)
                ],
                index: lastIndex
            };
            notifierScope.messages.unshift(messageWrapper);

            var msgWrapper = `<div class="notification-wrapper type-` + messageWrapper.source.Type + `" id="index-` + lastIndex+`">
                <div class="notification">
                    <div class="body">`+ messageWrapper.source.Body + `</div>
                    <div class="remove"><i class="fa fa-times-circle" aria-hidden="true"></i></div>

                </div>
            </div>`;
            $(msgWrapper).appendTo(findLastChild(fullWrapper));
            setTimeout(function () {
                if (notifierScope.messages.find(a => a.index === messageWrapper.index)) {
                    messageWrapper.remove();
                }
            }, removeDelay * (message.Type === 'success' ? 1 : 2));
            $(findLastChild($('#index-' + lastIndex))).on('click', function () { messageWrapper.remove(); });
        });
        $('.kernel-system').fadeIn('slow');
        $('.kernel-system').css('display', 'block');
    }
}