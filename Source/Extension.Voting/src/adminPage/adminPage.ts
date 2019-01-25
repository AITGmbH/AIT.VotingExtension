import { LogExtension } from "../shared/logExtension";
import { AdminPageController } from "./adminPageController";

(function () {
    LogExtension.debugEnabled = false;

    try {
        VSS.ready(() => {
            LogExtension.log("VSS ready");
            let controller = new AdminPageController().$mount("#adminPage");
            $('#appVersion').text(VSS.getExtensionContext().version);

            let form = $('#admin-form');
            let querySelectButton = $('#query-select-button');
            let queryTreeContainer = $('#query-tree-container');

            queryTreeContainer.bind('selectionchanged', function (e, args) {
                if (args.selectedNode.application) {
                    querySelectButton.text(args.selectedNode.application.path);
                    controller.actualVoting.query = args.selectedNode.application.id;
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