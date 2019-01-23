import { Voting } from "../entities/voting";
import { AdminPageService } from "./adminPageService";
import { LogExtension } from "../shared/logExtension";
import { bsNotify, escapeText } from "../shared/common";
import * as controls from "VSS/Controls";
import * as dialogs from "VSS/Controls/Dialogs";
import * as menus from "VSS/Controls/Menus";
import * as navigation from "VSS/Controls/Navigation";
import * as statusIndicators from "VSS/Controls/StatusIndicator";
import Vue from "vue";
import Component from "vue-class-component";
import { VotingTypes } from "../entities/votingTypes";

@Component
export class AdminPageController extends Vue {
    private waitControl: statusIndicators.WaitControl;
    private menuBar: menus.MenuBar;
    
    public adminPageService: AdminPageService = new AdminPageService();
    public actualVoting: Voting = new Voting();
    public types: string[] = [ VotingTypes.LEVEL, VotingTypes.ITEM, VotingTypes.QUERY ];
    public userIsAdmin: boolean = true;
    public showContent: boolean = false;
    public votingType: string = VotingTypes.LEVEL;
    
    public get levels() {
        return this.adminPageService.witLevelNames;
    }

    public get items() {
        return this.adminPageService.witTypeNames;
    }

    public get queries() {
        return this.adminPageService.flatQueryNames;
    }
    
    public mounted() {
        document.getElementById(this.$el.id).classList.remove("hide");
        this.adminPageService = new AdminPageService();
        
        this.waitControl = controls.create(statusIndicators.WaitControl, $('#waitContainer'), {
            message: "Loading..."
        });
        
        this.initializeAdminpageAsync();
    }
    
    public isMultipleVotingEnabledChanged() {
        if (this.actualVoting.isMultipleVotingEnabled && this.actualVoting.numberOfVotes === 1) {
            this.actualVoting.numberOfVotes = 3;
        }
    }

    /**
     * Helper function since direct binding runs into race-condition.
     */
    public updateVotingType() {
        this.votingType = this.actualVoting.type;
    }

    public get isBacklogBased() {
        return this.votingType == VotingTypes.LEVEL;
    }

    public get isItemBased() {
        return this.votingType == VotingTypes.ITEM;
    }

    public get isQueryBased() {
        return this.votingType == VotingTypes.QUERY;
    }

    /**
     * Initialize and binds a vote setting to this controller.
     * If origin is null or undefined, a new vote setting will be created.
     * 
     * @param origin Binds a loaded setting to this contoller.  
     */
    private initVoting(origin?: Voting) {
        if (origin === null || origin == undefined) {
            origin = new Voting();
            origin.created = Math.round((new Date()).getTime() / 1000);
        }
        <Voting>Object.assign(this.actualVoting, origin); //assign so we keep bindings!!!
        this.actualVoting.type = this.actualVoting.type || VotingTypes.LEVEL;
        this.actualVoting.level = this.actualVoting.level || this.levels[0].id;
        this.actualVoting.item = this.actualVoting.item || this.items[0];
        this.actualVoting.query = this.actualVoting.query || this.queries[0].id;
    }

    private createNewVoting() {
        this.initVoting();
        this.showContent = true;
        this.createMenueBar(true);
    }

    private showInfo() {
        dialogs.show(dialogs.ModalDialog, {
            title: "Help",
            contentText: "During a voting you can edit all properties. But please be aware that when changing the voting level or the number of votes per item all votes are reset.",
            buttons: []
        });
    }

    private async initializeAdminpageAsync(): Promise<void> {
        this.waitControl.startWait();

        try {
            await this.adminPageService.loadProjectAsync();
            await this.adminPageService.loadTeamsAsync();

            this.generateTeamPivot();

            await this.initAsync();
        } finally {
            this.waitControl.endWait();
        }
    }

    private async initAsync() {
        this.waitControl.startWait();

        try {
            await this.adminPageService.loadWitTypeNamesAsync();
            await this.adminPageService.loadWitLevelNamesAsync();
            await this.adminPageService.loadFlatQueryNamesAsync();

            this.initVoting(await this.adminPageService.loadVotingAsync());
            this.updateVotingType();
            this.buildAdminpage();
        } finally {
            this.waitControl.endWait();
        }
    }

    private buildAdminpage() {
        if (this.actualVoting.isVotingEnabled) {
            LogExtension.log("actual voting enabled");

            this.showContent = true;
            this.createMenueBar(true);
        } else {
            LogExtension.log("actual voting disabled");

            this.showContent = false;
            this.createMenueBar(false);
        }
    }

    private async saveSettingsAsync(isEnabled: boolean, isPaused: boolean | null = null) {
        const voting = this.actualVoting;

        voting.title = escapeText(voting.title);
        if ((voting.title == null || voting.title === "") && isEnabled) {
            bsNotify("danger", "Please provide a title for the voting.");
            return;
        }

        voting.lastModified = Math.round((new Date()).getTime() / 1000);
        voting.description = escapeText(voting.description);
        voting.team = this.adminPageService.team.id;

        voting.isVotingEnabled = isEnabled;

        if (isPaused != null) {
            voting.isVotingPaused = isPaused;
        }

        LogExtension.log("Voting:", voting);

        await this.adminPageService.saveVotingAsync(voting);
        await this.initAsync();
    }

    private getMenuItems(isActive: boolean): IContributedMenuItem[] {
        if (this.actualVoting == null || !this.actualVoting.isVotingEnabled) {
            if (!isActive) {
                return [
                    { id: "createNewVoting", text: "Create new voting", icon: "icon icon-add", disabled: !this.userIsAdmin }
                ];
            }
        }

        const items = [
            <any>{ id: "saveSettings", text: "Save", title: "Save voting", icon: "icon icon-save", disabled: !this.userIsAdmin }
        ];

        if (this.actualVoting.isVotingPaused) {
            items.push({ id: "resumeVoting", title: "Resume voting", icon: "icon icon-play", disabled: !this.userIsAdmin });
        } else {
            items.push({ id: "pauseVoting", title: "Pause voting", icon: "icon icon-pause", disabled: !this.userIsAdmin });
        }

        items.push({ id: "terminateVoting", title: "Stop voting", icon: "icon icon-delete", disabled: !this.userIsAdmin });
        items.push({ separator: true });
        items.push({ id: "infoButton", title: "Help", icon: "icon icon-info", disabled: false });

        return items;
    }

    private createMenueBar(isActive: boolean) {
        if (this.menuBar == null) {
            this.menuBar = controls.create(menus.MenuBar, $("#menueBar-container"), {
                showIcon: true,
                executeAction: (args) => {
                    var command = args.get_commandName();
                    this.executeMenuAction(command);
                }
            });
        
            document.getElementById("menueBar-container").classList.remove("hide");
        }

        this.menuBar.updateItems(this.getMenuItems(isActive));
    }

    private executeMenuAction(command: string) {
        switch (command) {
            case "createNewVoting":
                this.createNewVoting();
                break;
            case "saveSettings":
                this.saveSettingsAsync(true);
                break;
            case "pauseVoting":
                this.saveSettingsAsync(true, true);
                break;
            case "resumeVoting":
                this.saveSettingsAsync(true, false);
                break;
            case "infoButton":
                this.showInfo();
                break;
            case "terminateVoting":
                this.saveSettingsAsync(false);
                break;
        }
    }

    private generateTeamPivot() {
        controls.create(navigation.PivotFilter, $(".filter-container"), {
            behavior: "dropdown",
            text: "Team",
            items: this.adminPageService.teams.map(team => {
                return {
                    id: team.id,
                    text: team.name,
                    value: team.id,
                    selected: this.adminPageService.team.id === team.id
                };
            }).sort((a, b) => a.text.localeCompare(b.text)),
            change: (item) => {
                this.adminPageService.team = item;
                this.initAsync();
            }
        });
    }
}