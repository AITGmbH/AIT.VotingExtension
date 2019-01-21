import { LogExtension } from "../shared/logExtension";
import { AdminPageController } from "./adminPageController";
import { ReportPageController } from "../reportPage/reportPageController";

(function () {
    LogExtension.debugEnabled = false;

    try {
        VSS.ready(() => {
            LogExtension.log("VSS ready");
            new AdminPageController().$mount("#adminPage");
            new ReportPageController().$mount("#reportContainer");
            $('#appVersion').text(VSS.getExtensionContext().version);
        });
    } catch (ex) {
        LogExtension.log(ex);
    }
})();