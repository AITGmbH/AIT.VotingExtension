import { LogExtension } from "../shared/logExtension";
import { AdminPageController } from "./adminPageController";

(function () {
    LogExtension.debugEnabled = false;

    try {
        VSS.ready(() => {
            LogExtension.log("VSS ready");
            var controller = new AdminPageController().$mount("#adminPage");
            $('#appVersion').text(VSS.getExtensionContext().version);

            var querySelectButton = $('#query-select-button');
            var queryTreeContainer = $('#query-tree-container');

            queryTreeContainer.bind('selectionchanged', function (e, args) {
                querySelectButton.text(args.selectedNode.application.path);
                controller.actualVoting.query = args.selectedNode.application.id;
            });
        });
    } catch (ex) {
        LogExtension.log(ex);
    }
})();