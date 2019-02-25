import { LogExtension } from "../shared/logExtension";
import { AdminPageController } from "./adminPageController";

(function() {
    LogExtension.debugEnabled = false;

    try {
        VSS.ready(() => {
            LogExtension.log("VSS ready");
            new AdminPageController().$mount("#adminPage");
            $("#appVersion").text(VSS.getExtensionContext().version);
        });
    } catch (ex) {
        LogExtension.log(ex);
    }
})();
