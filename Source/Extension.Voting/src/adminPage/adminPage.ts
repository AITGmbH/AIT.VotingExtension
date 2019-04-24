import { LogExtension } from "../shared/logExtension";
import { AdminPageController } from "./adminPageController";
import { ReportPageController } from "../reportPage/reportPageController";
import { ReportDisplayService } from "../reportPage/reportDisplayService";
import { TeamFilterController } from "../teamFilter/teamFilterController";
import { TeamFilterDisplayService } from "../teamFilter/teamFilterDisplayService";

(function () {
    LogExtension.debugEnabled = false;

    try {
        VSS.ready(() => {
            LogExtension.log("VSS ready");
            const teamFilterDisplayService = new TeamFilterDisplayService();
            const reportDisplayService = new ReportDisplayService();

            const tfc = new TeamFilterController({
                data: { teamFilterDisplayService }
            });
            const apc = new AdminPageController({
                data: { reportDisplayService, teamFilterDisplayService }
            });
            const rpc = new ReportPageController({
                data: { reportDisplayService }
            });
            const wc = apc.initWaitControl("#waitContainer");

            rpc.report_grid_container = "report-grid-container";
            rpc.report_menu_container = "report-menu-container";
            rpc.waitControl = wc;

            apc.$mount("#adminPage");
            rpc.$mount("#reportPage");
            tfc.$mount("#teamFilter");

            $("#appVersion").text(VSS.getExtensionContext().version);

            let form = $("#admin-form");
            let queryTreeContainer = $("#query-tree-container");

            queryTreeContainer.bind("selectionchanged", (e, args) =>
                apc.queryTreeSelectionChanged(args.selectedNode)
            );

            window.addEventListener("resize", function () {
                form.height(window.innerHeight * 0.9 - 100);
            });
        });
    } catch (ex) {
        LogExtension.log(ex);
    }
})();
