var LogExtension = /** @class */ (function () {
    function LogExtension() {
    }
    LogExtension.log = function (value, obj) {
        if (LogExtension.debugEnabled) {
            if (window.console) {
                console.log(value);
                if (obj != null) {
                    console.log(obj);
                }
            }
        }
    };
    LogExtension.debugEnabled = false;
    return LogExtension;
}());
