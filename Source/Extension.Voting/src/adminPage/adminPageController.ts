import { Voting } from "../entities/voting";
import { AdminPageService } from "./adminPageService";
import { LogExtension } from "../shared/logExtension";
import { bsNotify, escapeText } from "../shared/common";
import * as controls from "VSS/Controls";
import * as menus from "VSS/Controls/Menus";
import { TreeView, TreeNode } from "VSS/Controls/TreeView";
import * as dialogs from "VSS/Controls/Dialogs";
import * as navigation from "VSS/Controls/Navigation";
import * as statusIndicators from "VSS/Controls/StatusIndicator";
import Vue from "vue";
import Component from "vue-class-component";
import moment from "moment";
import { VotingTypes } from "../entities/votingTypes";
import { ReportDisplayService } from "../reportPage/reportDisplayService";

@Component
export class AdminPageController extends Vue {
    private readonly StandardDatePattern = "YYYY-MM-DD";
    private readonly StandardTimePattern = "HH:mm";
    private readonly StandardDateTimePattern = "YYYY-MM-DD HH:mm";
    private waitControl: statusIndicators.WaitControl;
    private menuBar: menus.MenuBar;
    private reportDisplayService: ReportDisplayService;

    public adminPageService: AdminPageService = new AdminPageService();
    public actualVoting: Voting = new Voting();
    public actualVotingHasVotes: boolean = false;
    public types: string[] = [VotingTypes.LEVEL, VotingTypes.QUERY];
    public userIsAdmin: boolean = true;
    public showContent: boolean = false;
    public votingType: string = VotingTypes.LEVEL;
    public isPageVisible: boolean = true;

    public startDate: string = "";
    public startTime: string = "";
    public endDate: string = "";
    public endTime: string = "";

    public get levels() {
        return this.adminPageService.witLevelNames;
    }

    public get items() {
        return this.adminPageService.witTypeNames;
    }

    public get queries() {
        return this.adminPageService.flatQueryNames;
    }

    public get isAdminPageVisible() {
        return !this.actualVotingHasVotes && !this.actualVoting.isVotingEnabled || this.actualVoting.isVotingEnabled;
    }

    public created() {
        document.getElementById("adminPage").classList.remove("hide");
    }

    public mounted() {
        document.getElementById(this.$el.id).classList.remove("hide");
        this.adminPageService = new AdminPageService();
        this.initWaitControl('#waitContainer');
        this.initializeAdminpageAsync();
        this.$el.classList.remove("hide");
        this.reportDisplayService.subscribeToCreateNewVoting(this.showVotingIsExistingDialog);
    }

    public validateInput() {
        this.actualVoting.voteLimit = Math.max(1, this.actualVoting.voteLimit);
        this.actualVoting.numberOfVotes = Math.max(
            1,
            this.actualVoting.numberOfVotes
        );
    }

    public isMultipleVotingEnabledChanged() {
        if (
            this.actualVoting.isMultipleVotingEnabled &&
            this.actualVoting.numberOfVotes === 1
        ) {
            this.actualVoting.numberOfVotes = 3;
        }
    }

    /**
     * Helper function since direct binding runs into race-condition.
     */
    public updateVotingType() {
        this.votingType = this.actualVoting.type;

        switch (this.votingType) {
            case VotingTypes.LEVEL:
                this.waitControl.startWait();
                this.adminPageService
                    .loadWitLevelNamesAsync()
                    .then(
                        () => this.waitControl.endWait(),
                        () => this.waitControl.endWait()
                    );
                break;
            case VotingTypes.ITEM:
                this.waitControl.startWait();
                this.adminPageService
                    .loadWitTypeNamesAsync()
                    .then(
                        () => this.waitControl.endWait(),
                        () => this.waitControl.endWait()
                    );
                break;
            case VotingTypes.QUERY:
                this.createQueryTree();
                break;
            default:
                LogExtension.log("warning:", "Unknown VotingType!");
                break;
        }
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

    public get currentQueryName() {
        let current = this.queries.find(i => i.id == this.actualVoting.query);
        return current ? current.name : null;
    }

    public useEndTimeChanged($event) {
        if ($event.target.checked && !this.getEndDate().isValid()) {
            let possibleEndDate = moment();
            if (this.getStartDate().isValid()) {
                possibleEndDate = this.getStartDate().add(1, "d");
            }
            this.endDate = possibleEndDate.format(this.StandardDatePattern);
            this.endTime = possibleEndDate.format(this.StandardTimePattern);
        }
    }

    public useStartTimeChanged($event) {
        if ($event.target.checked && !this.getStartDate().isValid()) {
            let startDate = moment();
            if (this.getEndDate().isValid()) {
                var endDate = this.getEndDate();
                if (!endDate.isAfter(startDate)) {
                    endDate.add(1, "d");
                    this.endDate = endDate.format(this.StandardDatePattern);
                    this.endTime = endDate.format(this.StandardTimePattern);
                }
            }

            this.startDate = startDate.format(this.StandardDatePattern);
            this.startTime = startDate.format(this.StandardTimePattern);
        }
    }

    public getStartDate(): moment.Moment {
        var currentDate = moment(this.startDate);
        if (currentDate.isValid()) {
            var startTime = moment(this.startTime, this.StandardTimePattern);
            currentDate.set({
                hours: startTime.hours(),
                minutes: startTime.minutes()
            });
        }
        return currentDate;
    }

    public getEndDate(): moment.Moment {
        var currentDate = moment(this.endDate);
        if (currentDate.isValid()) {
            var endTime = moment(this.endTime, this.StandardTimePattern);
            currentDate.set({
                hours: endTime.hours(),
                minutes: endTime.minutes()
            });
        }
        return currentDate;
    }

    public setEndDate(value: number) {
        var currentDateTime = moment(value);
        this.endDate = currentDateTime.format(this.StandardDatePattern);
        this.endTime = currentDateTime.format(this.StandardTimePattern);
    }

    public setStartDate(value: number) {
        var currentDateTime = moment(value);
        this.startDate = currentDateTime.format(this.StandardDatePattern);
        this.startTime = currentDateTime.format(this.StandardTimePattern);
    }

    public isDateRangeValid(): boolean {
        return this.getStartDate().isBefore(this.getEndDate());
    }


    private createNewVoting() {
        this.adminPageService.deleteDocumentAsync();
        this.initVoting();
        this.showContent = true;
        this.createMenueBar(true);
    }

    private showVotingIsExistingDialog() {
        let htmlContentString: string =
            "<html><body><div>When you create a new voting, the results of the last voting are discarded. If you need them, please copy them first.</div></body></html>"
        let dialogContent = $.parseHTML(htmlContentString);
        let dialogOptions = {
            title: "Create new voting",
            content: dialogContent,
            buttons: {
                Confirm: () => {
                    dialog.close();
                    this.reportDisplayService.setReportVisibility(false);
                    this.createNewVoting();
                },
                Cancel: () => {
                    dialog.close();
                }
            },
            hideCloseButton: true
        };
        let dialog = dialogs.show(dialogs.ModalDialog, dialogOptions);
    }

    private showInfo() {
        dialogs.show(dialogs.ModalDialog, {
            title: "Help",
            contentText:
                "During a voting you can edit all properties. But please be aware that when changing the voting level or the number of votes per item all votes are reset.",
            buttons: []
        });
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
            origin.created = Math.round(new Date().getTime() / 1000);
        }

        <Voting>Object.assign(this.actualVoting, origin); //assign so we keep bindings!!!
        this.actualVoting.type = this.actualVoting.type || VotingTypes.LEVEL;
        this.actualVoting.level =
            this.actualVoting.level ||
            (this.levels.length
                ? this.levels[this.levels.length - 1].id
                : null);
        this.actualVoting.item =
            this.actualVoting.item ||
            (this.items.length ? this.items[0] : null);
        this.actualVoting.query =
            this.actualVoting.query ||
            (this.queries.length ? this.queries[0].id : null);

        if (this.actualVoting.useStartTime) {
            this.setStartDate(this.actualVoting.start);
        }
        if (this.actualVoting.useEndTime) {
            this.setEndDate(this.actualVoting.end);
        }
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
            this.initVoting(await this.adminPageService.loadVotingAsync());
            this.actualVotingHasVotes = await this.adminPageService.votingHasVotes();
            this.updateVotingType();
            this.buildAdminpage();
            this.validateReportVisibility();
        } finally {
            this.waitControl.endWait();
        }
    }

    private buildAdminpage() {
        this.waitControl.startWait();

        try {
            if (this.actualVoting.isVotingEnabled) {
                LogExtension.log("actual voting enabled");

                this.showContent = true;
                this.createMenueBar(true);
            } else {
                LogExtension.log("actual voting disabled");

                this.showContent = false;
                this.createMenueBar(false);
            }
        } finally {
            this.waitControl.endWait();
        }
    }

    private async saveSettingsAsync(
        isEnabled: boolean,
        isPaused: boolean | null = null
    ) {
        const voting = this.actualVoting;
        if (voting.useStartTime) {
            voting.start = this.getStartDate().valueOf();
        }

        if (voting.useEndTime) {
            voting.end = this.getEndDate().valueOf();
        }

        voting.title = escapeText(voting.title);
        if ((voting.title == null || voting.title === "") && isEnabled) {
            bsNotify("danger", "Please provide a title for the voting.");
            return;
        }

        if (voting.useStartTime) {
            if (!voting.start) {
                bsNotify(
                    "danger",
                    "Invalid time period. Please make sure that start date and time is filled!"
                );
                return;
            }
        }

        if (voting.useEndTime) {
            if (!voting.end) {
                bsNotify(
                    "danger",
                    "Invalid time period. Please make sure that end date and time is filled!"
                );
                return;
            }
        }

        if (voting.useEndTime && voting.end < Date.now()) {
            bsNotify(
                "danger",
                "Invalid time period. Please make sure that End is in the future!"
            );
            return;
        }

        if (voting.start >= voting.end) {
            bsNotify(
                "danger",
                "Invalid time period. Please make sure that End is later than Start!"
            );
            return;
        }

        voting.lastModified = Math.round(new Date().getTime() / 1000);
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
                    {
                        id: "createNewVoting",
                        text: "Create new voting",
                        icon: "icon icon-add",
                        disabled: !this.userIsAdmin
                    }
                ];
            }
        }

        const items = [
            <any>{
                id: "saveSettings",
                text: "Save",
                title: "Save voting",
                icon: "icon icon-save",
                disabled: !this.userIsAdmin
            }
        ];

        if (this.actualVoting.isVotingPaused) {
            items.push({
                id: "resumeVoting",
                title: "Resume voting",
                icon: "icon icon-play",
                disabled: !this.userIsAdmin
            });
        } else {
            items.push({
                id: "pauseVoting",
                title: "Pause voting",
                icon: "icon icon-pause",
                disabled: !this.userIsAdmin
            });
        }

        items.push({
            id: "terminateVoting",
            title: "Stop voting",
            icon: "icon icon-delete",
            disabled: !this.userIsAdmin
        });
        items.push({ separator: true });
        items.push({
            id: "infoButton",
            title: "Help",
            icon: "icon icon-info",
            disabled: false
        });

        return items;
    }

    private createMenueBar(isActive: boolean) {
        if (this.menuBar == null) {
            this.menuBar = controls.create(
                menus.MenuBar,
                $("#menueBar-container"),
                {
                    showIcon: true,
                    executeAction: args => {
                        var command = args.get_commandName();
                        this.executeMenuAction(command);
                    }
                }
            );

            document
                .getElementById("menueBar-container")
                .classList.remove("hide");
        }

        this.menuBar.updateItems(this.getMenuItems(isActive));
    }

    private createQueryTree() {
        const that = this;
        const pathTree: any = {};
        const options = {
            nodes: []
        };

        function createPathTree() {
            for (let query of that.queries) {
                let path = query.name.split("/");
                let node = pathTree;
                for (let key of path) {
                    if (!node[key]) {
                        node[key] = {};
                    }
                    node = node[key];
                }
                node.id = query.id;
                node.path = query.name;
            }
        }

        function createNodesRecursive(root: TreeNode, pathTree: any) {
            for (let key in pathTree) {
                if (key == "id" || key == "path") {
                    root.application = { id: pathTree.id, path: pathTree.path };
                    root.icon = "bowtie-view-list query-type-icon bowtie-icon";
                    break;
                } else {
                    let node = new TreeNode(key);
                    node.expanded = true;
                    node.icon = "bowtie-icon bowtie-folder";
                    root.add(node);
                    createNodesRecursive(node, pathTree[key]);
                }
            }
        }

        function createNodes() {
            var hasAtLeastOneNode: boolean;
            for (let key in pathTree) {
                hasAtLeastOneNode = true;
                let node = new TreeNode(key);
                node.expanded = true;
                node.icon = "bowtie-icon bowtie-folder";
                options.nodes.push(node);
                createNodesRecursive(node, pathTree[key]);
            }

            if (!hasAtLeastOneNode) {
                let rootNode = new TreeNode("Shared Queries");
                rootNode.expanded = true;
                rootNode.icon = "bowtie-icon bowtie-folder";
                let emptyNode = new TreeNode("No queries defined");
                emptyNode.icon = "bowtie-icon bowtie-view-list query-type-icon";

                rootNode.add(emptyNode);
                options.nodes.push(rootNode);
            }
        }

        this.waitControl.startWait();
        this.adminPageService.loadFlatQueryNamesAsync().then(
            () => {
                try {
                    createPathTree();
                    createNodes();

                    $("#query-tree-container").text("");
                    controls.create(
                        TreeView,
                        $("#query-tree-container"),
                        options
                    );
                    $("#query-select-button").text(this.currentQueryName);
                } finally {
                    this.waitControl.endWait();
                }
            },
            () => this.waitControl.endWait()
        );
    }

    private executeMenuAction(command: string) {
        switch (command) {
            case "createNewVoting":
                if (this.actualVotingHasVotes) {
                    this.showVotingIsExistingDialog();
                } else {
                    this.createNewVoting();
                }
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
            items: this.adminPageService.teams
                .map(team => {
                    return {
                        id: team.id,
                        text: team.name,
                        value: team.id,
                        selected: this.adminPageService.team.id === team.id
                    };
                })
                .sort((a, b) => a.text.localeCompare(b.text)),
            change: item => {
                this.adminPageService.team = item;
                this.initAsync();
            }
        });
    }

    public initWaitControl(ele: any): statusIndicators.WaitControl {
        if (!this.waitControl) {
            this.waitControl = controls.create(statusIndicators.WaitControl, $(ele), {
                message: "Loading..."
            });
        }
        return this.waitControl;
    }

    public validateReportVisibility() {
        let isReportVisible = false;
        if (!this.actualVoting.isVotingEnabled && this.actualVotingHasVotes) {
            isReportVisible = true;
        }
        this.reportDisplayService.setReportVisibility(isReportVisible);
    }

}
