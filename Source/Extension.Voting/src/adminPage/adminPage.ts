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

            let form = $('#admin-form');
            let querySelectButton = $('#query-select-button');
            let queryTreeContainer = $('#query-tree-container');

            queryTreeContainer.bind('selectionchanged', function (e, args) {
                if (args.selectedNode.application) {
                    querySelectButton.text(args.selectedNode.application.path);
                    apc.actualVoting.query = args.selectedNode.application.id;
                }
            });

            window.addEventListener('resize', function () {
                form.height(window.innerHeight * 0.9 - 100);
            });
        });
    } catch (ex) {
        LogExtension.log(ex);
    }
})();