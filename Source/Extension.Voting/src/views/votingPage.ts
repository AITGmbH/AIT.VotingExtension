import { LogExtension } from "../shared/logExtension";
import { VotingPageController } from "../controllers/votingPageController";

(function () {
    LogExtension.debugEnabled = false;

    try {
        VSS.ready(() => {
            LogExtension.log("VSS ready");
            new VotingPageController();
        });
    } catch (ex) {
        LogExtension.log(ex);
    }
})();