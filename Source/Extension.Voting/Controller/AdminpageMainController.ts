/// <reference types="jquery" />
/// <reference types="vss-web-extension-sdk" />
///<reference path="AdminpageController.ts"/>

declare function toggleActive();
declare function createMenueBar(boolean);
declare function showInfoDialog();
declare function generateCombos();

///<summary>
///Main-class, contains the methods of the clickevents on the View
///</summary>
class AdminpageMain {
    private static adminController: AdminpageController;
    private static userIsAdmin: boolean;
    private static settings: Voting;
    private static combos;

    static startApplication(waitcontrol) {
        waitcontrol.startWait();
        var adminController = new AdminpageController(waitcontrol);
        adminController.initializeAdminpage();
        AdminpageMain.setAdminController(adminController);
        generateCombos();
    }

    static setMultipleVotes(isEnabled: boolean) {
        this.adminController.ActualVoting.IsMultipleVotingEnabled = isEnabled;
    }

    static setLevel(level: string) {
        this.adminController.ActualVoting.Level = level;
    }

    static setDescription(description: string) {
        this.adminController.ActualVoting.Description = description;
    }

    static setTitle(title: string) {
        this.adminController.ActualVoting.Title = title;
    }

    static setAdminController(value: AdminpageController) {
        this.adminController = value;
        if (this.combos != undefined) {
            this.adminController.setCombos(this.combos[0], this.combos[1], this.combos[2], this.combos[3]);
        }
        this.userIsAdmin = true; // VSS.getWebContext().team.userIsAdmin;
    }

    static saveClicked(value: string) {
        this.adminController.saveSettings(value);
    }

    static votingEnabledClicked() {
        toggleActive();
        if ($("#content").hasClass("hide") == false) {
            var voting = this.adminController.ActualVoting;
            voting.Created = Math.round((new Date()).getTime() / 1000);
            this.adminController.ActualVoting = voting;
            createMenueBar("true");
        }
    }

    static cancelClicked() {
        $('#content').toggleClass("hide", true);
        this.adminController.ActualVoting = new Voting();
        this.adminController.buildAdminpage();
    }

    static loadExcludeList() {
        var excludes = this.adminController.getExcludes();
        var levels = this.adminController.getLevels();
        var excludeContainer = $("#excludeListbody");
        excludeContainer.empty();
        var includeContainer = $("#includeListbody");
        includeContainer.empty();
        var panel = $("div[name='itemPanel']");

        $.each(excludes, (index, item) => {
            var panelnew = panel.clone();
            panelnew.show();
            panelnew.attr("id", item.replace(/\s+/g, ''));
            panelnew.children(".panel-body").html(item);
            excludeContainer.append(panelnew);
        })

        $.each(levels, (index, item) => {
            var panelnew = panel.clone();
            panelnew.attr("id", item.replace(/\s+/g, ''));
            panelnew.show();
            panelnew.children(".panel-body").html(item);
            includeContainer.append(panelnew);
        })
    }

    static getMenuItems(isActive: string): IContributedMenuItem[] {
        $('#menueBar-container').toggleClass("hide", false);
        $('#no-permissions').toggleClass("hide", true);
        $('#error-message').toggleClass("hide", true);
        if (this.adminController.ActualVoting == undefined ||
            this.adminController.ActualVoting == null ||
            !this.adminController.ActualVoting.IsVotingEnabled) {
            if (isActive == "true") {
                if (!this.userIsAdmin) {
                    $('#no-permissions').toggleClass("hide");
                }
                return [
                    { id: "createNewVoting", text: "Save Voting", title: "Save settings", icon: "icon icon-save", disabled: !this.userIsAdmin },
                    { id: "cancelVoting", title: "Cancel Voting", icon: "icon icon-delete", disabled: !this.userIsAdmin },
                    { separator: true },
                    { id: "excludeList", title: "Exclude Types", icon: "icon icon-settings", disabled: !this.userIsAdmin }
                ];
            }
            if (isActive == "false") {
                if (!this.userIsAdmin) {
                    $('#errorMessage').toggleClass("hide", false);
                }
                return [
                    { id: "createVoting", text: "Create new..", icon: "icon icon-add", disabled: !this.userIsAdmin },
                    { separator: true },
                    { id: "excludeList", title: "Exclude Types", icon: "icon icon-settings", disabled: !this.userIsAdmin }
                ];
            }
        }
        if (!this.userIsAdmin) {
            $('#no-permissions').toggleClass("hide");
        }
        return [
            { id: "saveSettings", text: "Save", title: "Save edited voting", icon: "icon icon-save", disabled: !this.userIsAdmin },
            { id: "terminateVoting", title: "Stop Voting", icon: "icon icon-delete", disabled: !this.userIsAdmin },
            { separator: true },
            { id: "infoButton", title: "Help", icon: "icon icon-info", disabled: false },
            { id: "excludeList", title: "Exclude Types", icon: "icon icon-settings", disabled: !this.userIsAdmin }
        ];
    }

    static showInfo() {
        showInfoDialog();
    }

    static setCombos(title, description, multipleVotes, level) {
        if (this.adminController != undefined) {
            this.adminController.setCombos(title, description, multipleVotes, level);
        } else {
            this.combos = [title, description, multipleVotes, level];
        }
    }

    static addToExcludeList(item: string) {
        this.adminController.addToExclude(item);
    }

    static addToIncludeList(item: string) {
        this.adminController.addToInclude(item);
    }

    static changeProcess() {
        this.adminController.changeProcess($("#process").val() as string);
    }
}