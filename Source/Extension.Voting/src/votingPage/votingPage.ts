import { LogExtension } from "../shared/logExtension";
import { VotingPageController } from "./votingPageController";

(function () {
    LogExtension.debugEnabled = false;

    try {
        VSS.ready(() => {
            LogExtension.log("VSS ready");
            new VotingPageController().$mount("#votingPage");
        });
    } catch (ex) {
        LogExtension.log(ex);
    }
})();