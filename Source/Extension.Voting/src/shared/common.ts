import { LogExtension } from "./logExtension";

export function bsNotify(type, message) {
    LogExtension.log("in notify function");

    $.notify({
        icon: "glyphicon glyphicon-warning-sign",
        title: "",
        message: message
    },
        {
            type: type,
            placement: {
                from: "top",
                align: "right"
            },
            animate: {
                enter: 'animated fadeInUp',
                exit: 'animated fadeOutDown'
            },
            template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-pastel-{0}" role="alert">' +
                '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
                '<span data-notify="message">{2}</span>' +
                '</div>',
            allow_dismiss: true,
            delay: 5 * 1000,
            newest_on_top: true
        });
    return;
}

export function createAIEvent(message, account) {
    var aiEvent = new CustomEvent(
        message,
        {
            detail: {
                message: message,
                acoount: account,
            }
        }
    );
    return aiEvent;
}

export function parseEmail(inputText) {
    var regexMail = /(.+?)\s<[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}>/i;
    var matchMail = regexMail.exec(inputText);
    if (matchMail != null) {
        return matchMail[1];
    }
    return inputText;
}

export function getUrlParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export function escapeText(s: string): string {
    s = s.replace("<", "");
    s = s.replace(">", "");

    return s;
}