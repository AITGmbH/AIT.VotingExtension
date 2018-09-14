import { LogExtension } from "../shared/logExtension";
import { AdminPageController } from "../controllers/adminPageController";

(function () {
    LogExtension.debugEnabled = false;

    try {
        VSS.ready(() => {
            LogExtension.log("VSS ready");
            new AdminPageController();
            $('#appVersion').text(VSS.getExtensionContext().version);
        });
    } catch (ex) {
        LogExtension.log(ex);
    }
})();