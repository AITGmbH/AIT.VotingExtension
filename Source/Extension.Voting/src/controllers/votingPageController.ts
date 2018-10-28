
import { BaseController } from "./baseController";
import { Vote } from "../entities/vote";
import { VotingItem } from "../entities/votingItem";
import { VotingPageService } from "../services/votingPageService";
import { Voting } from "../entities/voting";
import { LogExtension } from "../shared/logExtension";
import { CookieService } from "../services/cookieService";
import { VotingStatus } from "../entities/votingStatus";
import * as controls from "VSS/Controls";
import * as grids from "VSS/Controls/Grids";
import * as statusIndicators from "VSS/Controls/StatusIndicator";
import * as wi from "TFS/WorkItemTracking/Services";
import * as dialogs from "VSS/Controls/Dialogs";
import * as navigation from "VSS/Controls/Navigation";
import * as menus from "VSS/Controls/Menus";
import { parseEmail } from "../shared/common";

export class VotingPageController extends BaseController {
    private grid: any;
    private extensionContext: IExtensionContext;
    private votingService: VotingPageService;
    private myVotes: Vote[];
    private allVotes: Vote[];
    private adminpageUri: string;
    private lockButtons: boolean;
    private actualVotingItems: Array<VotingItem>;
    private remainingVotes: number;
    private waitControl: statusIndicators.WaitControl;
    private cookieService: CookieService;

    constructor() {
        super();

        this.extensionContext = VSS.getExtensionContext();

        this.waitControl = controls.create(statusIndicators.WaitControl, $('#waitContainer'), {
            message: "Loading..."
        });

        this.waitControl.startWait();

        try {
            this.cookieService = new CookieService();

            this.votingService = new VotingPageService();
            this.votingService.nothingToVote = (isThereAnythingToVote: boolean) => this.nothingToVote(isThereAnythingToVote);
            this.votingService.initializeVotingpage = () => this.init();
            this.votingService.numberOfMyVotes = () => this.numberOfMyVotes;
            this.votingService.calculating = () => {
                this.calculating();
                this.calculateMyVotes();
            };
            this.votingService.getActualVotingItems = () => this.actualVotingItems;

            this.initializeVotingpage();
        } finally {
            this.waitControl.endWait();
        }
    }

    private createAdminpageUri() {
        const host = this.votingService.context.host.uri;
        const project = escape(this.votingService.context.project.name);
        const team = this.votingService.team;

        const publisher = this.extensionContext.publisherId;
        const extensionId = this.extensionContext.extensionId;

        const uri = `${host}${project}/_settings/${publisher}.${extensionId}.Voting.Administration?teamId=${team.id}`;

        this.adminpageUri = uri;
        document.getElementById("linkToAdminpage").setAttribute("href", uri);
    }

    private voteUpClicked(voteId: number) {
        if (!this.lockButtons) {
            this.lockButtons = true;

            appInsights.trackEvent("Vote up", {
                Account: this.votingService.context.account.name,
                ExtensionId: this.extensionContext.extensionId,
                TeamProject: this.votingService.context.project.id,
            });

            this.saveVoting(voteId, true);
        }
    }

    private voteDownClicked(voteId: number) {
        if (!this.lockButtons) {
            this.lockButtons = true;

            appInsights.trackEvent("Vote down", {
                Account: this.votingService.context.account.name,
                ExtensionId: this.extensionContext.extensionId,
                TeamProject: this.votingService.context.project.id,
            });

            this.saveVoting(voteId, false);
        }
    }

    private initializeItem(id: number, voteUp: HTMLElement, voteDown: HTMLElement) {
        const votingItem = this.actualVotingItem(id);
        voteUp.parentElement.classList.add("hide");
        voteDown.parentElement.classList.add("hide");

        if (this.remainingVotes > 0) {
            if (votingItem.myVotes === 0 || this.actualVoting.isMultipleVotingEnabled) {
                voteUp.parentElement.classList.remove("hide");
            }
        }

        if (votingItem.myVotes > 0) {
            voteDown.parentElement.classList.remove("hide");
        }
    }

    private async initializeVotingpage() {        
        await this.votingService.load();        

        this.createVotingTable();
        this.generateTeamPivot();

        await this.init();
    }

    private async init() {
        this.waitControl.startWait();

        try {
            this.createAdminpageUri();

            this.setAttributes(this.votingService.context.user, this.votingService.team);

            const hasAcceptedDataProtection = this.cookieService.isCookieSet();

            if (hasAcceptedDataProtection) {
                LogExtension.log("loadVoting");
                var voting = await this.votingService.loadVoting();

                if (voting === VotingStatus.NoActiveVoting) {
                    this.votingInactive();
                    return;
                } else if (voting === VotingStatus.NoVoting) {
                    this.votingInactive();
                    return;
                } else {                
                    document.getElementById("contentVotingActive").classList.remove("hide");
                    document.getElementById("contentVotingInactive").classList.add("hide");
                }

                LogExtension.log("loadVotes");
                await this.votingService.loadVotes();

                LogExtension.log("getAreas");
                await this.votingService.getAreas();

                LogExtension.log("loadRequirements");
                await this.votingService.loadRequirements();

                this.actualVoting = this.votingService.getSettings();
                this.calculating();
                this.buildVotingTable();
                this.nothingToVote(true);
            } else {
                LogExtension.log("loadUserConfirmationDialog");

                this.initializeDataProtectionDialog();
                this.notAllowedToVote();
            }
        } finally {
            this.waitControl.endWait();
        }
    }

    private calculating() {
        this.remainingVotes = this.actualVoting.numberOfVotes;
        this.myVotes = new Array<Vote>();
        this.allVotes = new Array<Vote>();
        if (this.votingService.votes != null) {
            for (const item of this.votingService.votes) {
                if (item.votingId === this.actualVoting.created) {
                    this.allVotes.push(item);
                }
            }
        }
    }

    private calculateMyVotes() {
        this.actualVotingItems = new Array<VotingItem>();
        for (const reqItem of this.votingService.getRequirements()) {
            var votingItemTemp: VotingItem = {
                ...reqItem,
                myVotes: 0,
                allVotes: 0
            };

            if (this.allVotes != null) {
                for (const vote of this.allVotes) {
                    if (vote.workItemId === reqItem.id) {
                        votingItemTemp.allVotes++;

                        if (vote.userId === this.user.id) {
                            this.myVotes.push(vote);
                            this.remainingVotes--;
                            votingItemTemp.myVotes++;
                        }
                    }
                }
            }

            LogExtension.log(votingItemTemp);
            this.actualVotingItems.push(votingItemTemp);
        }

        LogExtension.log("finished calculating MyVotes");
        return;
    }

    private displayRemainingVotes() {
        const container = document.getElementById("remainingVotesDiv");

        switch (this.remainingVotes) {
            case 0:
                container.innerHTML = "<p>You have no votes left</p>";
                break;
            case 1:
                container.innerHTML = "<p>You have 1 vote left</p>";
                break;
            default:
                container.innerHTML = `<p>You have ${this.remainingVotes} votes left</p>`;
                break;
        }
    }

    private buildVotingTable() {
        this.actualVotingItems = new Array<VotingItem>();

        this.calculateMyVotes();
        this.displayRemainingVotes();

        LogExtension.log("set Data");
        this.grid.setDataSource(this.actualVotingItems);
        this.lockButtons = false;

        LogExtension.log("Data online");

        if (this.user.isAdmin) {
            this.createVotingMenue();
        }
    }

    private setVotingSettings() {
        if (this.actualVoting == null) {
            this.actualVoting = new Voting();
        }

        if (this.actualVoting.title != null) {
            document.getElementById("titleDiv").innerHTML = `<p>${this.actualVoting.title}</p>`;
        }

        if (this.actualVoting.description != null) {
            document.getElementById("informationDiv").innerHTML = `<p>${this.actualVoting.description}</p>`;
        }
    }

    private votingInactive() {
        document.getElementById("grid-container").classList.add("hide");
        document.getElementById("contentVotingActive").classList.add("hide");
        document.getElementById("contentVotingInactive").classList.remove("hide");
    }

    private notAllowedToVote() {
        document.getElementById("grid-container").classList.add("hide");
        document.getElementById("contentVotingActive").classList.add("hide");
        document.getElementById("notAllowedToVote").classList.remove("hide");
    }

    private saveVoting(id: number, upVote: boolean) {
        if (upVote) {
            for (const item of this.actualVotingItems) {
                if (item.id === id) {
                    var vote = new Vote();

                    if (this.allVotes != null) {
                        vote.id = this.allVotes.length;
                    }

                    vote.userId = this.user.id;
                    vote.votingId = this.actualVoting.created;
                    vote.workItemId = id;

                    this.votingService.saveVote(vote);
                }
            }
        } else {
            this.votingService.deleteVote(id, this.user.id);
        }
    }

    private get numberOfMyVotes(): number {
        return this.myVotes.length;
    }

    private actualVotingItem(id: number): VotingItem {
        var votingItem;

        for (const item of this.actualVotingItems) {
            if (item.id === id) {
                votingItem = item;
            }
        }

        return votingItem;
    }

    private nothingToVote(isThereAnythingToVote) {
        this.setVotingSettings();

        if (isThereAnythingToVote) {
            document.getElementById("grid-container").classList.remove("hide");
            document.getElementById("nothingToVote").classList.add("hide");
        } else {
            document.getElementById("grid-container").classList.add("hide");
            document.getElementById("nothingToVote").classList.remove("hide");
        }
    }

    private applyToBacklog() {
        this.votingService.applyToBacklog();
    }

    private removeAllUservotes(): any {
        this.removeAllUservotesDialog();
    }

    private removeAllUservotesDialog() {
        let htmlContentString: string = "<html><body><div>Please note that deleting all your personal voting related data from storage deletes all your votes. This includes votes from currently running votings as well as from historical votings within the current team project.</div></body></html>";
        let dialogContent = $.parseHTML(htmlContentString);
        let dialogOptions = {
            title: "Delete all user data",
            content: dialogContent,
            buttons: {
                "Delete": () => {
                    this.votingService.removeAllUservotes(this.user.id);
                    dialog.close();
                },
                "Cancel": () => {
                    dialog.close();
                }
            },
            hideCloseButton: true
        };

        let dialog = dialogs.show(dialogs.ModalDialog, dialogOptions);
    }

    private initializeDataProtectionDialog() {
        let htmlContentString: string = "<html><body><div>Please note that when using the voting extension personal and confidential information is only saved in your Azure DevOps account using the built-in Azure DevOps data storage service. You find more information about that service at <a href=\"https://docs.microsoft.com/en-us/vsts/extend/develop/data-storage?view=vsts\" target=\"_blank\">Microsoft Docs: Azure DevOps Data storage</a>.<br/>We also collect some telemetry data using Application Insights (\"AI\"). As part of AI telemetry collection the standard AI telemetry data (<a href=\"https://docs.microsoft.com/en-us/azure/application-insights/app-insights-data-retention-privacy\" target = \"_blank\" >Microsoft Docs: Data collection, retention and storage in Application Insights</a>) as well as the (Azure DevOps / TFS) account name and Team Project id is tracked.<br/>For general information on data protection, please refer to our data protection declaration.<br/>By confirming this notification you accept this terms of use.</div></body></html>";
        let dialogContent = $.parseHTML(htmlContentString);
        let dialogOptions = {
            title: "Terms of Use",
            content: dialogContent,
            buttons: {
                "Confirm": () => {
                    this.cookieService.setCookie();
                    dialog.close();

                    this.notAllowedToVote();
                    this.initializeVotingpage();
                },
                "Decline": () => {
                    dialog.close();
                }
            },
            hideCloseButton: true
        };

        let dialog = dialogs.show(dialogs.ModalDialog, dialogOptions);
    }

    private createVotingMenue() {
        controls.create(menus.MenuBar, $("#votingMenue-container"), {
            showIcon: true,
            items: [
                {
                    id: "refresh", title: "Refresh",
                    icon: "icon icon-refresh", disabled: false
                },
                {
                    id: "applyToBacklog", title: "Apply to backlog",
                    icon: "icon icon-tfs-query-edit", disabled: false
                },
                {
                    separator: true
                },
                {
                    id: "adminpageLink", title: "Visit settings page",
                    icon: "icon icon-settings", disabled: false
                },
                {
                    separator: true
                },
                {
                    id: "removeAllUserdata", title: "Delete user data from storage",
                    icon: "icon icon-delete", disabled: false
                }
            ],
            executeAction: (args) => {
                var command = args.get_commandName();
                switch (command) {
                    case "applyToBacklog":
                        this.applyToBacklog();
                        break;
                    case "adminpageLink":
                        var url = this.adminpageUri;
                        window.open(url, '_blank');
                        break;
                    case "refresh":
                        this.initializeVotingpage();
                        break;
                    case "removeAllUserdata":
                        this.removeAllUservotes();
                        break;
                }
            }
        });

        $('#votingMenue-container').remove("hide");
    }

    private createVotingTable() {
        const that = this;

        this.grid = controls.create(grids.Grid, $("#grid-container"), {
            height: "400px",
            allowMultiSelect: false,
            columns: [
                {
                    tooltip: "Vote up", fieldId: "voteUp", canSortBy: false, width: 20, getCellContents: function (_, dataIndex) {
                        var voteId = this.getRowData(dataIndex).id;

                        var upVoteControl = '<div class="grid-cell grid-buttonVoteUp-holder" role="gridcell" style="width: 20px;">';
                        upVoteControl += '<span class="upvote-holder">';
                        upVoteControl += `<span class="icon icon-add voting-plus hide" aria-hidden="true"></span>`;
                        upVoteControl += '</span></div>';

                        var element = $(upVoteControl);
                        element.find('.voting-plus').click(() => that.voteUpClicked(voteId));

                        return element;
                    }
                }, {
                    tooltip: "Vote down", fieldId: "voteDown", canSortBy: false, width: 20, getCellContents: function (_, dataIndex) {
                        var voteId = this.getRowData(dataIndex).id;

                        var downVoteControl = '<div class="grid-cell grid-buttonVoteDown-holder" role="gridcell" style="width: 20px;">';
                        downVoteControl += '<span class="downvote-holder">';
                        downVoteControl += `<span class="icon icon-delete voting-remove hide" aria-hidden="true"></span>`;
                        downVoteControl += '</span></div>';

                        var element = $(downVoteControl);
                        element.find('.voting-remove').click(() => that.voteDownClicked(voteId));

                        return element;
                    }
                },
                { tooltip: "Work Item ID", text: "ID", index: "id", width: 50, fieldId: "itemId" },
                { tooltip: "Work Item Type", text: "Work Item Type", index: "workItemType", width: 100 },
                { tooltip: "Work Item Title", text: "Title", index: "title", width: 200 },
                { tooltip: "Assigned team member", text: "Assigned To", index: "assignedTo", width: 125 },
                { tooltip: "Work Item State", text: "State", index: "state", width: 100 },
                { tooltip: "All votes per item", text: "Votes", index: "allVotes", width: 60 },
                { tooltip: "My Votes per item", text: "My Votes", index: "myVotes", width: 60 },
                { text: "Order", index: "order", width: 50, hidden: true }
            ],
            openRowDetail: async (index) => {
                var item = this.grid.getRowData(index);
                const service = await wi.WorkItemFormNavigationService.getService();
                service.openWorkItem(item.id);
            },
            sortOrder: [{
                index: "allVotes",
                order: "desc"
            },
            {
                index: "order",
                order: "asc"
            }],
            autoSort: true
        });

        this.lockButtons = false;

        var observer = new MutationObserver((_) => {
            observer.disconnect();

            $('.grid-row').each((_, element) => {
                var cellAddButton = $(element).find('div:nth-child(1)');
                var cellRemoveButton = $(element).find('div:nth-child(2)');
                var cellId = $(element).find('div:nth-child(3)');
                var cellWorkItemType = $(element).find('div:nth-child(4)');
                var cellTitle = $(element).find('div:nth-child(5)');
                var cellAssignedTo = $(element).find('div:nth-child(6)');

                var title = $(cellTitle).text();
                var cssClass = $(cellWorkItemType).text().toLowerCase().replace(/\s+/g, '');
                var assignedTo = parseEmail($(cellAssignedTo).text());

                $(cellTitle).text('');
                $(cellTitle).append('<div class="work-item-color ' + cssClass + '-color">&nbsp;</div>');
                $(cellTitle).append('<span>' + title + '</span>');
                $(cellAssignedTo).text(assignedTo);

                var voteUpButton = $(cellAddButton).find('span > span.icon');
                var voteDownButton = $(cellRemoveButton).find('span > span.icon');

                const voteId = parseInt($(cellId).text(), 10);

                this.initializeItem(voteId, voteUpButton[0], voteDownButton[0]);
            });

            observer.observe(document.getElementById('grid-container'), { childList: true, subtree: true });
        });

        observer.observe(document.getElementById('grid-container'), { childList: true, subtree: true });
    }

    private generateTeamPivot() {
        controls.create(navigation.PivotFilter, $(".filter-container"), {
            behavior: "dropdown",
            text: "Team",
            items: this.votingService.teams.map(team => {
                return {
                    id: team.id,
                    text: team.name,
                    value: team.id,
                    selected: this.votingService.team.id === team.id
                };
            }).sort((a, b) => a.text.localeCompare(b.text)),
            change: (item) => {
                this.votingService.team = item;
                this.init();
            }
        });
    }
}