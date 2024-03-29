﻿import * as controls from "VSS/Controls";
import * as dialogs from "VSS/Controls/Dialogs";
import * as grids from "VSS/Controls/Grids";
import * as menus from "VSS/Controls/Menus";
import * as navigation from "VSS/Controls/Navigation";
import * as statusIndicators from "VSS/Controls/StatusIndicator";
import * as workItemTrackingService from "TFS/WorkItemTracking/Services";
import Component from "vue-class-component";
import moment from "moment";
import Vue from "vue";
import { UserAgreementService } from "../services/userAgreementService";
import { LogExtension } from "../shared/logExtension";
import { User } from "../entities/user";
import { Vote } from "../entities/vote";
import { Voting } from "../entities/voting";
import { VotingItem } from "../entities/votingItem";
import { VotingPageService } from "./votingPageService";
import { VotingStatus } from "../entities/votingStatus";
import { VotingTypes } from "../entities/votingTypes";
import { compareUserString } from "../shared/common";

@Component
export class VotingPageController extends Vue {
    private grid: grids.Grid;
    private extensionContext: IExtensionContext;
    private myVotes: Vote[];
    private allVotes: Vote[];
    private lockButtons: boolean;
    private actualVotingItems: Array<VotingItem>;
    private waitControl: statusIndicators.WaitControl;
    private userAgreementService: UserAgreementService;
    private user: User;
    private startTimerId: number;
    private endTimerId: number;

    public votingService: VotingPageService = new VotingPageService();
    public remainingVotes: number = 0;
    public adminpageUri: string = "";
    public actualVoting: Voting = new Voting();
    public status: VotingStatus = VotingStatus.NoVoting;

    public mounted() {
        document.getElementById(this.$el.id).classList.remove("hide");
        this.waitControl = controls.create(
            statusIndicators.WaitControl,
            $("#waitContainer"),
            {
                message: "Loading..."
            }
        );

        this.extensionContext = VSS.getExtensionContext();
        this.userAgreementService = new UserAgreementService();

        this.votingService = new VotingPageService();
        this.votingService.nothingToVote = (isThereAnythingToVote: boolean) =>
            (this.status = !isThereAnythingToVote
                ? VotingStatus.NothingToVote
                : this.status);
        this.votingService.getVoteItem = (id: number) =>
            this.actualVotingItem(id);
        this.votingService.numberOfMyVotes = () => this.numberOfMyVotes;
        this.initializeVotingpageAsync();
    }

    private createAdminpageUri() {
        const host = this.votingService.context.host.uri;
        const project = escape(this.votingService.context.project.name);
        const team = this.votingService.team;

        const publisher = this.extensionContext.publisherId;
        const extensionId = this.extensionContext.extensionId;

        const uri = `${ host }${ project }/_settings/${ publisher }.${ extensionId }.Voting.Administration?teamId=${
            team.id
            }`;

        this.adminpageUri = uri;
    }

    private voteUpClicked(voteId: number) {
        if (!this.lockButtons) {
            this.lockButtons = true;

            appInsights.trackEvent("Vote up", {
                Account: this.votingService.context.account.name,
                ExtensionId: this.extensionContext.extensionId,
                TeamProject: this.votingService.context.project.id
            });

            this.saveVotingAsync(voteId, true);
        }
    }

    private voteDownClicked(voteId: number) {
        if (!this.lockButtons) {
            this.lockButtons = true;

            appInsights.trackEvent("Vote down", {
                Account: this.votingService.context.account.name,
                ExtensionId: this.extensionContext.extensionId,
                TeamProject: this.votingService.context.project.id
            });

            this.saveVotingAsync(voteId, false);
        }
    }

    private initializeItem(
        id: number,
        voteUp: HTMLElement,
        voteDown: HTMLElement
    ) {
        const votingItem = this.actualVotingItem(id);
        if (votingItem == null) {
            return;
        }

        voteUp.parentElement.classList.add("hide");
        voteDown.parentElement.classList.add("hide");

        if (this.remainingVotes > 0) {
            if (votingItem.myVotes < this.actualVoting.voteLimit) {
                voteUp.parentElement.classList.remove("hide");
            }
        }

        if (this.actualVoting.cannotVoteForAssignedWorkItems) {
            if (compareUserString(votingItem.assignedToFull, this.user)) {                
                voteUp.parentElement.classList.add("hide");
                voteDown.parentElement.classList.add("hide");
            }
        }        

        if (this.actualVoting.cannotVoteForOwnWorkItems) {
            if (compareUserString(votingItem.createdByFull, this.user)) {                
                voteUp.parentElement.classList.add("hide");
                voteDown.parentElement.classList.add("hide");
            }
        }

        if (votingItem.myVotes > 0) {
            voteDown.parentElement.classList.remove("hide");
        }
    }

    private async initializeVotingpageAsync() {
        this.waitControl.startWait();

        try {
            await this.votingService.loadProjectAsync();
            await this.votingService.loadTeamsAsync();
            var voting = await this.votingService.loadVotingAsync();
            <Voting>(
                Object.assign(
                    this.actualVoting,
                    voting
                )
            ); //assign keeps bindings!!!
            this.createVotingMenue();

            this.createVotingTable();
            this.generateTeamPivot();
            this.updateTeam(this.votingService.team);
            this.createTimers();
        } finally {
            this.waitControl.endWait();
        }
        await this.refreshAsync(true);
    }

    public isVisible(): boolean {
        return (
            this.status === VotingStatus.ActiveVoting ||
            this.status === VotingStatus.PausedVoting ||
            this.status === VotingStatus.ProspectiveVoting ||
            this.status === VotingStatus.OverdueVoting ||
            this.status === VotingStatus.NoVoting
        );
    }

    public isEditable(): boolean {
        return this.status === VotingStatus.ActiveVoting;
    }
    private async refreshAsync(lazy: boolean = false) {
        this.waitControl.startWait();

        try {
            if (!lazy) {
                LogExtension.log("reloadVoting");
                <Voting>(
                    Object.assign(
                        this.actualVoting,
                        await this.votingService.loadVotingAsync()
                    )
                ); //assign keeps bindings!!!
            }
            this.setStatus();
            this.createVotingMenue();
            this.validateSessionTimes();

            if (this.isVisible()) {
                var columns = this.grid.getColumns();
                columns[0].hidden = !this.isEditable();
                columns[1].hidden = !this.isEditable();
            }

            LogExtension.log("getAreas");
            await this.votingService.getAreasAsync();

            LogExtension.log("loadWorkItems");

            switch (this.actualVoting.type) {
                case VotingTypes.LEVEL:
                    await this.votingService.loadWorkItemsByTypesAsync(
                        this.actualVoting.level
                    );
                    break;
                case VotingTypes.QUERY:
                    await this.votingService.loadWorkItemsByQueryAsync(
                        this.actualVoting.query
                    );
                    break;
                default:
                    LogExtension.log("error:", "Unknown VotingType!");
                    this.votingService.resetRequirements();
                    break;
            }

            const hasAcceptedDataProtection = this.userAgreementService.isUserAgreementAccepted();
            if (hasAcceptedDataProtection) {
                await this.initAsync();
            } else {
                LogExtension.log("loadUserConfirmationDialog");

                this.initializeDataProtectionDialog();
                this.notAllowedToVote();
            }
        } finally {
            this.waitControl.endWait();
        }
    }

    private async initAsync() {
        this.waitControl.startWait();

        try {
            LogExtension.log("loadVotes");
            await this.votingService.loadVotesAsync();

            this.calculating();
            this.buildVotingTable();
        } finally {
            this.waitControl.endWait();
        }
    }

    private calculating() {
        this.remainingVotes = this.actualVoting.numberOfVotes;
        this.myVotes = new Array<Vote>();
        this.allVotes = new Array<Vote>();

        if (this.votingService.votes != null) {
            this.allVotes = this.votingService.votes;
        }
    }

    public get isBlindVotingEnabled() {
        const isBlindVoting = this.actualVoting.isBlindVotingEnabled;

        // if vote is paused, stopped or has ended (overdue), publish the result if enabled
        const isBlindVotingPublishResult = 
            this.actualVoting.isBlindVotingEnabled &&
            this.actualVoting.isBlindVotingPublishEnabled &&
            (this.status === VotingStatus.PausedVoting ||
                this.status === VotingStatus.OverdueVoting ||
                this.status === VotingStatus.NoVoting);

        return isBlindVoting && !isBlindVotingPublishResult;
    }

    private calculateMyVotes() {
        const userVotes = {};
        const numberOfVotes = this.actualVoting.numberOfVotes;

        this.actualVotingItems = new Array<VotingItem>();

        for (const reqItem of this.votingService.requirements) {
            var votingItemTemp: VotingItem = {
                ...reqItem,
                myVotes: 0,
                allVotes: 0
            };

            if (this.allVotes != null) {
                for (const vote of this.allVotes) {
                    if (vote.workItemId === reqItem.id) {
                        userVotes[vote.userId] =
                            (userVotes[vote.userId] || 0) + 1;
                        if (userVotes[vote.userId] > numberOfVotes) {
                            // cheating protection
                            continue;
                        }

                        const isBlindVotingUser = this.actualVoting.isBlindVotingEnabled 
                            && vote.userId === this.user.id;

                        const isNotBlindVoting = !this.actualVoting.isBlindVotingEnabled;

                        // if vote is paused, stopped or has ended (overdue), publish the result if enabled
                        const isBlindVotingPublishResult = 
                            this.actualVoting.isBlindVotingEnabled &&
                            this.actualVoting.isBlindVotingPublishEnabled &&
                            (this.status === VotingStatus.PausedVoting ||
                                this.status === VotingStatus.OverdueVoting ||
                                this.status === VotingStatus.NoVoting);

                        if (isNotBlindVoting || isBlindVotingUser || isBlindVotingPublishResult) {
                            votingItemTemp.allVotes++;
                        }

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
    }

    private buildVotingTable() {
        this.actualVotingItems = new Array<VotingItem>();

        this.calculateMyVotes();

        LogExtension.log("set Data");
        
        this.grid.setDataSource(this.actualVotingItems);
        this.lockButtons = false;

        LogExtension.log("Data online");
    }

    private notAllowedToVote() {
        this.status = VotingStatus.NotAllowedToVote;
    }

    private async saveVotingAsync(id: number, upVote: boolean) {
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

                    await this.votingService.saveVoteAsync(vote);
                }
            }
        } else {
            await this.votingService.deleteVoteAsync(id, this.user.id);
        }
        await this.initAsync();
    }

    private get numberOfMyVotes(): number {
        return this.myVotes.length;
    }

    private actualVotingItem(id: number): VotingItem {
        var possibleVotingItem = null;
        for (const votingItem of this.actualVotingItems) {
            if (votingItem.id === id) {
                possibleVotingItem = votingItem;
                break;
            }
        }
        return possibleVotingItem;
    }

    private showRemoveAllUserVotesDialog() {
        let htmlContentString: string =
            "<html><body><div>Please note that deleting all your personal voting related data from storage deletes all your votes. This includes votes from currently running votings as well as from historical votings within the current team project.</div></body></html>";
        let dialogContent = $.parseHTML(htmlContentString);
        let dialogOptions = {
            title: "Delete all user data",
            content: dialogContent,
            buttons: {
                Delete: async () => {
                    dialog.close();
                    this.removeUserVotesByTeamAsync();
                },
                Cancel: () => {
                    dialog.close();
                }
            },
            hideCloseButton: true
        };

        let dialog = dialogs.show(dialogs.ModalDialog, dialogOptions);
    }

    private initializeDataProtectionDialog() {
        let htmlContentString: string =
            '<html><body><div>Please note that when using the <a href="https://marketplace.visualstudio.com/items?itemName=AITGmbH.asap-voting-aitgmbh-de-production" target = "_blank" >AIT Voting Extension</a> personal and confidential information is only saved in your Azure DevOps account using the built-in Azure DevOps data storage service. You find more information about that service at <a href="https://docs.microsoft.com/en-us/vsts/extend/develop/data-storage?view=vsts" target="_blank">Microsoft Docs: Azure DevOps Data storage</a>.<br/>We also collect some telemetry data using Application Insights ("AI"). As part of AI telemetry collection the standard AI telemetry data (<a href="https://docs.microsoft.com/en-us/azure/application-insights/app-insights-data-retention-privacy" target = "_blank" >Microsoft Docs: Data collection, retention and storage in Application Insights</a>) as well as the (Azure DevOps / TFS) account name and Team Project id is tracked.<br/>For general information on data protection, please refer to our <a href="https://www.aitgmbh.de/datenschutz" target = "_blank" >data protection declaration</a>.<br/>By confirming this notification you accept this terms of use.</div></body></html>';
        let dialogContent = $.parseHTML(htmlContentString);
        let dialogOptions = {
            title: "Terms of Use",
            content: dialogContent,
            buttons: {
                Confirm: () => {
                    this.userAgreementService.acceptUserAgreement();
                    dialog.close();

                    this.refreshAsync();
                },
                Decline: () => {
                    dialog.close();
                }
            },
            hideCloseButton: true
        };

        let dialog = dialogs.show(dialogs.ModalDialog, dialogOptions);
    }

    private createVotingMenue() {
        $("#votingMenue-container").text("");
        controls.create(menus.MenuBar, $("#votingMenue-container"), {
            showIcon: true,
            items: [
                {
                    id: "refresh",
                    title: "Refresh",
                    icon: "icon icon-refresh",
                    disabled: false
                },
                {
                    separator: true
                },
                {
                    id: "adminpageLink",
                    title: "Visit settings page",
                    icon: "icon icon-settings",
                    disabled: false
                },
                {
                    separator: true
                },
                {
                    id: "removeUserVotes",
                    title: "Delete all your votes",
                    icon: "icon icon-delete",
                    disabled: this.canRemoveUserVotes()
                }
            ],
            executeAction: args => {
                var command = args.get_commandName();
                switch (command) {
                    case "adminpageLink":
                        window.open(this.adminpageUri, "_blank");
                        break;
                    case "refresh":
                        this.refreshAsync();
                        break;
                    case "removeUserVotes":
                        this.showRemoveAllUserVotesDialog();
                        break;
                }
            }
        });
    }

    private async removeUserVotesByTeamAsync() {
        this.waitControl.startWait();

        try {
            await this.votingService.removeUserVotesByTeamAsync(this.user.id);
            await this.refreshAsync();
        } finally {
            this.waitControl.endWait();
        }
    }

    private createVotingTable() {
        const that = this;

        this.grid = controls.create(grids.Grid, $("#grid-container"), {
            height: "70vh",
            allowMultiSelect: false,
            columns: [
                {
                    tooltip: "Vote up",
                    fieldId: "voteUp",
                    canSortBy: false,
                    width: 20,
                    getCellContents: function (_, dataIndex) {
                        var voteId = this.getRowData(dataIndex).id;

                        var upVoteControl =
                            '<div class="grid-cell grid-buttonVoteUp-holder cursor-pointer" role="gridcell" style="width: 20px;">';
                        upVoteControl += '<span class="upvote-holder">';
                        upVoteControl += `<span class="icon icon-add voting-plus hide" aria-hidden="true"></span>`;
                        upVoteControl += "</span></div>";

                        var element = $(upVoteControl);
                        element.click(() => that.voteUpClicked(voteId));

                        return element;
                    }
                },
                {
                    tooltip: "Vote down",
                    fieldId: "voteDown",
                    canSortBy: false,
                    width: 20,
                    getCellContents: function (_, dataIndex) {
                        var voteId = this.getRowData(dataIndex).id;

                        var downVoteControl =
                            '<div class="grid-cell grid-buttonVoteDown-holder cursor-pointer" role="gridcell" style="width: 20px;">';
                        downVoteControl += '<span class="downvote-holder">';
                        downVoteControl += `<span class="icon icon-delete voting-remove hide" aria-hidden="true"></span>`;
                        downVoteControl += "</span></div>";

                        var element = $(downVoteControl);
                        element.click(() => that.voteDownClicked(voteId));

                        return element;
                    }
                },
                {
                    tooltip: "Work Item ID",
                    text: "ID",
                    index: "id",
                    width: 50,
                    fieldId: "itemId"
                },
                {
                    tooltip: "Work Item Type",
                    text: "Work Item Type",
                    index: "workItemType",
                    width: 100
                },
                {
                    tooltip: "Work Item Title",
                    text: "Title",
                    index: "title",
                    width: 600
                },
                {
                    tooltip: "Assigned team member",
                    text: "Assigned To",
                    index: "assignedTo",
                    width: 125
                },
                {
                    tooltip: "Work Item State",
                    text: "State",
                    index: "state",
                    width: 100
                },
                ...(this.actualVoting.useExtraInfoFieldPriority ? [{
                    tooltip: "Priority",
                    text: "Priority",
                    index: "priority",
                    width: 60
                }] : [] ),
                ...(this.actualVoting.useExtraInfoFieldSize ? [{
                    tooltip: "Size",
                    text: "Size",
                    index: "size",
                    width: 60
                }] : [] ),
                ...(this.actualVoting.useExtraInfoFieldValueArea ? [{
                    tooltip: "Business Value",
                    text: "Business Value",
                    index: "valueArea",
                    width: 100
                }] : [] ),
                ...(this.actualVoting.useExtraInfoFieldEffort ? [{
                    tooltip: "Effort",
                    text: "Effort",
                    index: "effort",
                    width: 60
                }] : [] ),
                {
                    tooltip: "All votes per item",
                    text: "Votes",
                    index: "allVotes",
                    width: 60
                },
                {
                    tooltip: "My Votes per item",
                    text: "My Votes",
                    index: "myVotes",
                    width: 60
                },
                { text: "Order", index: "order", width: 50, hidden: true }
            ],
            openRowDetail: async (index) => {
                var item = this.grid.getRowData(index);
                const service = await workItemTrackingService.WorkItemFormNavigationService.getService();
                service.openWorkItem(item.id);
            },
            sortOrder: [
                {
                    index: "allVotes",
                    order: "desc"
                },
                {
                    index: "order",
                    order: "asc"
                }
            ],
            autoSort: true
        });

        this.lockButtons = false;

        var observer = new MutationObserver(_ => {
            observer.disconnect();
            if (this.status !== VotingStatus.ActiveVoting) {
                $(".grid-row").each((_, element) => {
                    var cellWorkItemType = $(element).find("div:nth-child(2)");
                    var cellTitle = $(element).find("div:nth-child(3)");
                    var title = $(cellTitle).text();
                    var cssClass = $(cellWorkItemType)
                        .text()
                        .toLowerCase()
                        .replace(/\s+/g, "");
                    $(cellTitle).text("");
                    $(cellTitle).append(
                        `<div class="work-item-color ${ cssClass }-color"></div>`
                    );
                    $(cellTitle).append(`<span> ${ title }</span>`);
                });
            } else {
                $(".grid-row").each((_, element) => {
                    var cellAddButton = $(element).find("div:nth-child(1)");
                    var cellRemoveButton = $(element).find("div:nth-child(2)");
                    var cellId = $(element).find("div:nth-child(3)");
                    var cellWorkItemType = $(element).find("div:nth-child(4)");
                    var cellTitle = $(element).find("div:nth-child(5)");
                    var title = $(cellTitle).text();
                    var cssClass = $(cellWorkItemType)
                        .text()
                        .toLowerCase()
                        .replace(/\s+/g, "");
                    $(cellTitle).text("");
                    $(cellTitle).append(
                        `<div class="work-item-color ${ cssClass }-color"></div>`
                    );
                    $(cellTitle).append(`<span> ${ title }</span>`);
                    var voteUpButton = $(cellAddButton).find("span > span.icon");
                    var voteDownButton = $(cellRemoveButton).find(
                        "span > span.icon"
                    );

                    const voteId = parseInt($(cellId).text(), 10);

                    this.initializeItem(voteId, voteUpButton[0], voteDownButton[0]);
                });
            }



            observer.observe(document.getElementById("grid-container"), {
                childList: true,
                subtree: true
            });
        });

        observer.observe(document.getElementById("grid-container"), {
            childList: true,
            subtree: true
        });
        $("#grid-container").append(
            "<div style='height: 20vh'><!--Whitespace--></div>"
        );
    }

    private generateTeamPivot() {
        controls.create(navigation.PivotFilter, $(".filter-container"), {
            behavior: "dropdown",
            text: "Team",
            items: this.votingService.teams
                .map(team => {
                    return {
                        id: team.id,
                        text: team.name,
                        value: team.id,
                        selected: this.votingService.team.id === team.id
                    };
                })
                .sort((a, b) => a.text.localeCompare(b.text)),
            change: item => {
                this.updateTeam(item);
                this.actualVoting = new Voting();
                this.refreshAsync();
            }
        });
    }

    private updateTeam(team) {
        this.votingService.team = team;
        this.createAdminpageUri();
        this.setAttributes(
            this.votingService.context.user,
            this.votingService.team
        );
    }

    private setAttributes(userContext: UserContext, teamContext: TeamContext) {
        this.user = new User();
        this.user.id = userContext.id;
        this.user.name = userContext.name;
        this.user.email = userContext.email;
        this.user.uniqueName = userContext.uniqueName;
        this.user.team = teamContext.id;
        this.user.isAdmin = true;
    }

    private setStatus() {
        var nowValue = moment().valueOf();

        if (
            this.actualVoting.useEndTime &&
            nowValue > this.actualVoting.end
        ) {
            this.status = VotingStatus.OverdueVoting;
        }
        else if (!this.actualVoting.isVotingEnabled) {
            this.status = VotingStatus.NoVoting;
        } else if (
            this.actualVoting.useStartTime &&
            nowValue < this.actualVoting.start
        ) {
            this.status = VotingStatus.ProspectiveVoting;
        } else if (this.actualVoting.isVotingPaused) {
            this.status = VotingStatus.PausedVoting;
        }
        else {
            this.status = VotingStatus.ActiveVoting;
        }
    }

    private validateSessionTimes() {
        if (this.actualVoting.useStartTime) {
            if (!this.actualVoting.start) {
                this.actualVoting.useStartTime = false;
            }
        }
        if (this.actualVoting.useEndTime) {
            if (!this.actualVoting.end) {
                this.actualVoting.useEndTime = false;
            }
        }
    }

    public getLocaleTimeString(timestamp: number): string {
        if (!timestamp) {
            return "";
        }
        return moment(timestamp).toLocaleString();
    }

    public getRelativeTimeString(timestamp: number): string {
        if (!timestamp) {
            return "";
        }
        return moment(timestamp).fromNow();
    }

    public getDatetimeString(timestamp: number): string {
        if (!timestamp) {
            return "";
        }
        return moment(timestamp).format("YYYY-MM-DD HH:mm");
    }

    private canRemoveUserVotes(): boolean {
        return this.status !== VotingStatus.ActiveVoting;
    }

    private createTimers() {
        if (this.actualVoting.useStartTime && this.actualVoting.start) {
            var ticksUntilStart = moment(this.actualVoting.start).diff(moment());
            if (ticksUntilStart > 0) {
                this.startTimerId = setTimeout(() => {
                    this.refreshAsync();
                    clearTimeout(this.startTimerId);
                }, ticksUntilStart);
            }
        }

        if (this.actualVoting.useEndTime && this.actualVoting.end) {
            var ticksUntilEnd = moment(this.actualVoting.end).diff(moment());
            if (ticksUntilEnd > 0) {
                this.endTimerId = setTimeout(() => {
                    this.refreshAsync();
                    clearTimeout(this.endTimerId);
                }, ticksUntilEnd);
            }
        }
    }
}
