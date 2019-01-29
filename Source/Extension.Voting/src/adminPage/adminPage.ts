import { LogExtension } from "../shared/logExtension";
import { AdminPageController } from "./adminPageController";
import { ReportPageController } from "../reportPage/reportPageController";

(function () {
    LogExtension.debugEnabled = false;

    try {
        VSS.ready(() => {
            LogExtension.log("VSS ready");
            const apc = new AdminPageController();
            const rpc = new ReportPageController();
            const wc = apc.initWaitControl('#waitContainer');

            rpc.height = "30vh";
            rpc.report_grid_container = "report-grid-container";
            rpc.report_menu_container = "report-menu-container";
            rpc.waitControl = wc;

            apc.$mount("#adminPage");
            rpc.$mount("#reportPage");

            $('#appVersion').text(VSS.getExtensionContext().version);
        });
    } catch (ex) {
        LogExtension.log(ex);
    }
})();