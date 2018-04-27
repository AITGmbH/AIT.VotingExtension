///<reference path="VotingpageController.ts"/>
var VotingpageMain = /** @class */ (function () {
    function VotingpageMain() {
    }
    VotingpageMain.startApplication = function (waitcontrol) {
        VotingpageMain.context = VSS.getWebContext();
        VotingpageMain.extensioncontext = VSS.getExtensionContext();
        waitcontrol.startWait();
        var votingController = new VotingpageController(waitcontrol);
        VotingpageMain.setVotingController(votingController);
        votingController.initializeVotingpage();
        VotingpageMain.createAdminpageUri();
        createVotingTable();
    };
    VotingpageMain.getAdminpageUri = function () {
        return VotingpageMain.adminpageUri;
    };
    VotingpageMain.setVotingController = function (value) {
        this.votingController = value;
        if (VotingpageMain.grid != undefined) {
            this.votingController.setGrid(VotingpageMain.grid);
        }
    };
    VotingpageMain.applyClicked = function () {
        this.votingController.applyToBacklog();
    };
    VotingpageMain.createAdminpageUri = function () {
        var x = VSS.getWebContext();
        var context = VSS.getExtensionContext();
        var host = x.host.uri;
        var project = x.project.name;
        var team = x.team.name;
        var publisher = context.publisherId;
        var extensionId = context.extensionId;
        project = project.replace("(", "%28");
        project = project.replace(")", "%29");
        team = team.replace("(", "%28");
        team = team.replace(")", "%29");
        var uri = host + project + "/" + team + "/_admin/_apps/hub/" + publisher + "." + extensionId + ".Voting.Administration";
        VotingpageMain.adminpageUri = uri;
        $('#linkToAdminpage').prop("href", uri);
    };
    VotingpageMain.voteUpClicked = function (element) {
        if (!this.votingController.LockButtons) {
            this.votingController.LockButtons = true;
            appInsights.trackEvent("Vote up", { ExtensionId: VotingpageMain.extensioncontext.extensionId, Account: VotingpageMain.context.account.name, TeamProject: VotingpageMain.context.project.id });
            var voteId = $(element).parents('.grid-row').find('div:nth-child(3)').text();
            this.votingController.saveVoting(voteId, true);
        }
    };
    VotingpageMain.voteDownClicked = function (element) {
        if (!this.votingController.LockButtons) {
            this.votingController.LockButtons = true;
            appInsights.trackEvent("Vote down", { ExtensionId: VotingpageMain.extensioncontext.extensionId, Account: VotingpageMain.context.account.name, TeamProject: VotingpageMain.context.project.id });
            var voteId = $(element).parents('.grid-row').find('div:nth-child(3)').text();
            this.votingController.saveVoting(voteId, false);
        }
    };
    VotingpageMain.initializeItem = function (id, voteUp, voteDown) {
        var votingItem = this.votingController.actualVotingItem(id);
        $(voteUp).parent().toggleClass("hide", true);
        $(voteDown).parent().toggleClass("hide", true);
        if (this.votingController.RemainingVotes > 0) {
            if (votingItem.MyVotes == 0 || this.votingController.ActualVoting.IsMultipleVotingEnabled) {
                $(voteUp).parent().toggleClass("hide");
            }
        }
        if (votingItem.MyVotes > 0) {
            $(voteDown).parent().toggleClass("hide");
        }
    };
    VotingpageMain.setGrid = function (grid) {
        if (this.votingController != undefined) {
            this.votingController.setGrid(grid);
        }
        else {
            VotingpageMain.grid = grid;
        }
    };
    VotingpageMain.refresh = function () {
        window.location.href = window.location.href;
    };
    VotingpageMain.refreshTable = function () {
        VotingpageMain.votingController.initializeVotingpage();
    };
    return VotingpageMain;
}());
