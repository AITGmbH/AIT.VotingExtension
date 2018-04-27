function bsNotify(type, message) {
    
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

function createAIEvent(message, account) {
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