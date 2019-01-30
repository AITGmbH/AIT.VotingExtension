import { LogExtension } from "../shared/logExtension";
import { VotingPageController } from "./votingPageController";
import Vue from "vue";
import VueTimeago from "vue-timeago";

(function () {
    LogExtension.debugEnabled = false;

    try {
        VSS.ready(() => {
            LogExtension.log("VSS ready");
            new VotingPageController().$mount("#votingPage");
        });

        Vue.use(VueTimeago);
    } catch (ex) {
        LogExtension.log(ex);
    }
})();