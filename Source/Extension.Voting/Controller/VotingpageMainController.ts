///<reference path="VotingpageController.ts"/>
declare function createVotingTable();
declare var appInsights;

class VotingpageMain {
    private static votingController: VotingpageController;
    private static actualVotingItems: Array<VotingItem>;
    private static grid: any;
    private static adminpageUri: string;
    private static context: WebContext;
    private static extensioncontext: IExtensionContext;

    static startApplication(waitcontrol) {
        VotingpageMain.context = VSS.getWebContext();
        VotingpageMain.extensioncontext = VSS.getExtensionContext();
        waitcontrol.startWait();
        var votingController = new VotingpageController(waitcontrol);
        VotingpageMain.setVotingController(votingController);
        votingController.initializeVotingpage();
        VotingpageMain.createAdminpageUri();
        createVotingTable();
    }

    static getAdminpageUri(){
        return VotingpageMain.adminpageUri;
    }

    static setVotingController(value: VotingpageController) {
        this.votingController = value;
        if (VotingpageMain.grid != undefined) {
            this.votingController.setGrid(VotingpageMain.grid);
        }
    }

    static applyClicked() {
        this.votingController.applyToBacklog();
    }

    static createAdminpageUri() {
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
    }

    static voteUpClicked(element) {
        if (!this.votingController.LockButtons) {
            this.votingController.LockButtons = true;
            appInsights.trackEvent("Vote up", { ExtensionId: VotingpageMain.extensioncontext.extensionId, Account: VotingpageMain.context.account.name, TeamProject: VotingpageMain.context.project.id });
            var voteId = $(element).parents('.grid-row').find('div:nth-child(3)').text();
            this.votingController.saveVoting(voteId, true);
        }
    }

    static voteDownClicked(element) {
        if (!this.votingController.LockButtons) {
            this.votingController.LockButtons = true;
            appInsights.trackEvent("Vote down", { ExtensionId: VotingpageMain.extensioncontext.extensionId, Account: VotingpageMain.context.account.name, TeamProject: VotingpageMain.context.project.id });
            var voteId = $(element).parents('.grid-row').find('div:nth-child(3)').text();
            this.votingController.saveVoting(voteId, false);
        }
    }

    static initializeItem(id: string, voteUp: HTMLElement, voteDown: HTMLElement) {
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
    }

    static setGrid(grid) {
        if (this.votingController != undefined) {
            this.votingController.setGrid(grid);
        } else {
            VotingpageMain.grid = grid;
        }
    }

    static refresh() {
        window.location.href = window.location.href;
    }

    static refreshTable() {
        VotingpageMain.votingController.initializeVotingpage();
    }
}