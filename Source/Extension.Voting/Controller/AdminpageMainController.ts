/// <reference types="jquery" />
/// <reference types="vss-web-extension-sdk" />
///<reference path="AdminpageController.ts"/>
/// <reference path="../Services/VssVotingDataService.ts"/>


declare function toggleActive();
declare function createMenueBar(boolean: boolean);
declare function showInfoDialog();
declare function generateCombos();

///<summary>
///Main-class, contains the methods of the clickevents on the View
///</summary>
class AdminpageMain implements IReportView {

    private adminController: AdminpageController;
    private userIsAdmin: boolean;
    private settings: Voting;
    private combos;

    constructor(waitcontrol: any) {
        var dataService = new VssVotingDataService();
        var votingpagedataservice = new VotingpageDataController(new VotingpageController(waitcontrol, dataService), dataService);

        waitcontrol.startWait();
        var adminController = new AdminpageController(waitcontrol, this, dataService, votingpagedataservice);
        adminController.initializeAdminpage();
        this.setAdminController(adminController);
        generateCombos();
    }

    setMultipleVotes(isEnabled: boolean) {
        this.adminController.ActualVoting.IsMultipleVotingEnabled = isEnabled;
    }

    setLevel(level: string) {
        this.adminController.ActualVoting.Level = level;
    }

    setDescription(description: string) {
        this.adminController.ActualVoting.Description = description;
    }

    setTitle(title: string) {
        this.adminController.ActualVoting.Title = title;
    }

    setAdminController(value: AdminpageController) {
        this.adminController = value;
        if (this.combos != undefined) {
            this.adminController.setCombos(this.combos[0], this.combos[1], this.combos[2], this.combos[3]);
        }
        this.userIsAdmin = true; // VSS.getWebContext().team.userIsAdmin;
    }

    saveClicked(value: string) {
        this.adminController.saveSettings(value);
    }

    votingEnabledClicked() {
        toggleActive();
        if ($("#content").hasClass("hide") == false) {
            var voting = this.adminController.ActualVoting;
            voting.Created = Math.round((new Date()).getTime() / 1000);
            this.adminController.ActualVoting = voting;
            createMenueBar(true);
        }
    }

    cancelClicked() {
        $('#content').toggleClass("hide", true);
        this.adminController.ActualVoting = new Voting();
        this.adminController.buildAdminpage();
    }

    loadExcludeList() {
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

    getMenuItems(isActive: string): IContributedMenuItem[] {
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

    getReportContainer() {
        return $('#reportcontainer');
    }


    //public setReport(report: string): void {
    //    let obj = $('#reportcontainer');
    //    console.debug("obj:" + obj);
    //    obj.toggleClass("hide", false);
    //    obj.html(report);
    //}

    showInfo() {
        showInfoDialog();
    }

    setCombos(title, description, multipleVotes, level) {
        if (this.adminController != undefined) {
            this.adminController.setCombos(title, description, multipleVotes, level);
        } else {
            this.combos = [title, description, multipleVotes, level];
        }
    }

    addToExcludeList(item: string) {
        this.adminController.addToExclude(item);
    }

    addToIncludeList(item: string) {
        this.adminController.addToInclude(item);
    }

    changeProcess() {
        this.adminController.changeProcess($("#process").val() as string);
    }
}