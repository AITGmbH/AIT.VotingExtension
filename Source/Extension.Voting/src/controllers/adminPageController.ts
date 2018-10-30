import { Voting } from "../entities/voting";
import { VotingStatus } from "../entities/votingStatus";
import { BaseController } from "./baseController";
import { AdminPageService } from "../services/adminPageService";
import { LogExtension } from "../shared/logExtension";
import { bsNotify, escapeText } from "../shared/common";
import * as controls from "VSS/Controls";
import * as combos from "VSS/Controls/Combos";
import * as dialogs from "VSS/Controls/Dialogs";
import * as menus from "VSS/Controls/Menus";
import * as navigation from "VSS/Controls/Navigation";
import * as statusIndicators from "VSS/Controls/StatusIndicator";

export class AdminPageController extends BaseController {
    private adminPageService: AdminPageService;
    private levels: string[];
    private userIsAdmin: boolean;
    private titleCombo: combos.Combo;
    private descriptionCombo: combos.Combo;
    private multipleVotesCombo: combos.Combo;
    private levelCombo: combos.Combo;
    private waitControl: statusIndicators.WaitControl;
    private menuBar: menus.MenuBar;

    constructor() {
        super();

        this.adminPageService = new AdminPageService();
        this.userIsAdmin = true;

        this.waitControl = controls.create(statusIndicators.WaitControl, $('#waitContainer'), {
            message: "Loading..."
        });

        this.initializeAdminpageAsync();
    }

    private async createNewVotingAsync() {
        this.actualVoting = new Voting();
        await this.adminPageService.resetVotingAsync();

        this.generateLevelDropDown();

        this.toggleContent();

        this.actualVoting.created = Math.round((new Date()).getTime() / 1000);
        this.createMenueBar(true);
    }

    private loadExcludeList() {
        var excludes = this.adminPageService.excludes;
        var levels = this.levels;

        var excludeContainer = document.getElementById("excludeListbody");
        excludeContainer.innerHTML = '';

        var includeContainer = document.getElementById("includeListbody");
        includeContainer.innerHTML = '';

        var panel = document.querySelector("div[name='itemPanel']");

        for (const item of excludes) {
            var panelnew = panel.cloneNode(true) as HTMLElement;
            panelnew.style.display = '';
            panelnew.id = item.replace(/\s+/g, "");
            panelnew.querySelector(".panel-body").innerHTML = item;
            excludeContainer.appendChild(panelnew);
        }

        for (const item of levels) {
            var panelnew = panel.cloneNode(true) as HTMLElement;
            panelnew.style.display = '';
            panelnew.id = item.replace(/\s+/g, "");
            panelnew.querySelector(".panel-body").innerHTML = item;
            includeContainer.appendChild(panelnew);
        }

        const elements = document.querySelectorAll(".panel-default");
        for (let i = 0; i < elements.length; i++) {
            elements[i].addEventListener("dragstart", (ev) => this.startDrag(ev));
        }
    }

    private showInfo() {
        dialogs.show(dialogs.ModalDialog, {
            title: "Help",
            contentText: "During a voting you can only edit the title and the description of the voting.\nTo change other properties you have to stop the voting and create a new one.",
            buttons: []
        });
    }

    private async initializeAdminpageAsync(): Promise<void> {
        this.waitControl.startWait();

        try {
            await this.adminPageService.loadAsync();
            await this.adminPageService.loadWITFieldNamesAsync();

            this.generateCombos();
            this.generateTeamPivot();
            this.generateLevelDropDown();

            this.bindEvents();

            await this.initAsync();
        } finally {
            this.waitControl.endWait();
        }
    }

    private async initAsync() {
        this.waitControl.startWait();

        try {
            var votingStatus = await this.adminPageService.loadVotingAsync();
            if (votingStatus === VotingStatus.NoVoting) {
                this.actualVoting = await this.adminPageService.createNewVotingAsync();
            } else if (votingStatus === VotingStatus.NoActiveVoting) {
                this.actualVoting = new Voting();
            } else {
                this.actualVoting = this.adminPageService.actualVoting;
            }

            this.buildAdminpage();
        } finally {
            this.waitControl.endWait();
        }
    }

    private generateLevelDropDown() {
        const fieldNames = this.adminPageService.witFieldNames;
        if (fieldNames != null) {
            this.levels = fieldNames;
        }

        if (this.actualVoting == null) {
            this.levelCombo.setText(this.levels[0]);
        } else {
            this.levelCombo.setText(this.actualVoting.level || this.levels[0]);
        }

        this.levelCombo.setSource(this.levels);
    }

    private buildAdminpage() {
        this.generateLevelDropDown();
        this.createMenueBar(false);

        LogExtension.log("set Voting level");

        if (this.actualVoting != null) {
            LogExtension.log("actual Voting found");

            if (this.actualVoting.isVotingEnabled) {
                LogExtension.log("actual voting enabled");

                this.toggleContent();

                this.setEditable(false);
                this.titleCombo.setText(this.actualVoting.title);
                this.titleCombo.setInvalid(false);

                this.descriptionCombo.setText(this.actualVoting.description);

                if (this.actualVoting.isMultipleVotingEnabled) {
                    this.multipleVotesCombo.setText("Enabled");
                } else {
                    this.multipleVotesCombo.setText("Disabled");
                }

                this.levelCombo.setText(this.actualVoting.level);

                this.menuBar.updateItems(this.getMenuItems(true));
            } else {
                LogExtension.log("actual voting disabled");

                this.resetAdminpage();

                this.toggleContent(false);
            }
        } else {
            this.actualVoting = new Voting();
            this.titleCombo.setInvalid(true);
            this.levelCombo.setText(this.levels[0]);

            this.toggleContent();
        }

        LogExtension.log("finished initializing");
    }

    private toggleContent(showContent: boolean = true) {
        if (showContent) {
            document.getElementById("content").classList.remove("hide");
            document.getElementById("errorMessage").classList.add("hide");
        } else {
            document.getElementById("content").classList.add("hide");
            document.getElementById("errorMessage").classList.remove("hide");
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
        if (!isEnabled) {
            this.toggleContent(false);
        }

        if (isPaused != null) {
            voting.isVotingPaused = isPaused;
        }

        LogExtension.log("Level:", voting.level);
        if (voting.level == null) {
            voting.level = this.levelCombo.getText();
            LogExtension.log("New Level:", voting.level);
        }

        await this.adminPageService.saveVotingAsync(voting);

        if (voting.isVotingEnabled) {
            this.actualVoting = voting;
            this.buildAdminpage();
        } else {
            this.resetAdminpage();
            this.createMenueBar(false);
        }
    }

    private resetAdminpage() {
        LogExtension.log("reset the Adminpage");

        this.actualVoting = new Voting();
        this.titleCombo.setText("");
        this.titleCombo.setInvalid(true);
        this.descriptionCombo.setText("");
        this.setEditable(true);
        this.levelCombo.setText(this.levels[0]);

        LogExtension.log("finished resetting");
    }

    private async addToExcludeAsync(item: string) {
        await this.adminPageService.addToExcludeAsync(item);
        this.generateLevelDropDown();
    }

    private async addToIncludeAsync(item: string) {
        await this.adminPageService.addToIncludeAsync(item);
        this.generateLevelDropDown();
    }

    private getMenuItems(isActive: boolean): IContributedMenuItem[] {
        document.getElementById("menueBar-container").classList.remove("hide");

        if (this.userIsAdmin) {
            document.getElementById("no-permissions").classList.add("hide");
        } else {
            document.getElementById("no-permissions").classList.remove("hide");
        }

        if (this.actualVoting == null || !this.actualVoting.isVotingEnabled) {
            if (!isActive) {
                return [
                    { id: "createNewVoting", text: "Create new voting", icon: "icon icon-add", disabled: !this.userIsAdmin },
                    { separator: true },
                    { id: "excludeList", title: "Exclude work item types", icon: "icon icon-settings", disabled: !this.userIsAdmin }
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
        items.push({ id: "excludeList", title: "Exclude work item types", icon: "icon icon-settings", disabled: !this.userIsAdmin });

        return items;
    }

    private createMenueBar(isActive: boolean) {
        document.getElementById("menueBar-container").innerHTML = '';

        this.menuBar = controls.create(menus.MenuBar, $("#menueBar-container"), {
            showIcon: true,
            items: this.getMenuItems(isActive),
            executeAction: (args) => {
                var command = args.get_commandName();
                this.executeMenuAction(command);
            }
        });
    }

    private setEditable(isEnabled: boolean) {
        this.multipleVotesCombo.setEnabled(isEnabled);
        this.levelCombo.setEnabled(isEnabled);
    }

    private executeMenuAction(command: string) {
        switch (command) {
            case "createNewVoting":
                this.createNewVotingAsync();
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
            case "excludeList":
                this.loadExcludeList();
                $('#excludeModal').modal();
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

    private generateCombos() {
        this.titleCombo = controls.create(combos.Combo, $('#titleContainer'), {
            type: "list",
            label: "Provide a title for the voting (required)",
            mode: "text",
            enabled: true,
            value: "",
            invalidCss: "invalid",
            change: () => {
                if (this.titleCombo.getText() == "") {
                    this.titleCombo.setInvalid(true);
                } else {
                    this.titleCombo.setInvalid(false);
                    this.actualVoting.title = this.titleCombo.getText();
                }
            }
        });

        this.descriptionCombo = controls.create(combos.Combo, $('#descriptionContainer'), {
            type: "list",
            label: "Provide a description for the voting (optional)",
            mode: "text",
            value: "",
            enabled: true,
            change: () => {
                this.actualVoting.description = this.descriptionCombo.getText();
            }
        });

        this.multipleVotesCombo = controls.create(combos.Combo, $('#multipleVotesContainer'), {
            type: "list",
            mode: "drop",
            source: [
                "Disabled", "Enabled"
            ],
            value: "Disabled",
            allowEdit: false,
            enabled: true,
            indexChanged: () => {
                var isEnabled = this.multipleVotesCombo.getText() == "Enabled";
                this.actualVoting.isMultipleVotingEnabled = isEnabled;
                this.actualVoting.numberOfVotes = isEnabled ? 3 : 1;
            },
            disabledCss: "readOnly"
        });

        this.levelCombo = controls.create(combos.Combo, $('#levelContainer'), {
            type: "list",
            mode: "drop",
            allowEdit: false,
            enabled: true,
            change: () => {
                this.actualVoting.level = this.levelCombo.getText();
            },
            disabledCss: "readOnly"
        });
    }

    private bindEvents() {
        document.getElementById("includeListbody").addEventListener("drop", (ev) => this.addToIncludes(ev));
        document.getElementById("includeListbody").addEventListener("dragover", (ev) => this.onDragOver(ev));
        document.getElementById("excludeListbody").addEventListener("drop", (ev) => this.addToExcludes(ev));
        document.getElementById("excludeListbody").addEventListener("dragover", (ev) => this.onDragOver(ev));
    }

    private addToIncludes(ev) {
        ev.preventDefault();

        const id = ev.dataTransfer.getData("id");
        const text = ev.dataTransfer.getData("text");

        $("#includeListbody").append(document.getElementById(id));
        this.addToIncludeAsync(text);
    }

    private addToExcludes(ev) {
        ev.preventDefault();

        const id = ev.dataTransfer.getData("id");
        const text = ev.dataTransfer.getData("text");

        $("#excludeListbody").append(document.getElementById(id));
        this.addToExcludeAsync(text);
    }

    private startDrag(ev) {
        ev.dataTransfer.setData("id", ev.target.id);
        ev.dataTransfer.setData("text", ev.target.innerText.trim())
    }

    private onDragOver(ev) {
        ev.preventDefault();
    }
}