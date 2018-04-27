/// <reference types="jquery" />
/// <reference types="vss-web-extension-sdk" />
///<reference path="AdminpageController.ts"/>
///<summary>
///Main-class, contains the methods of the clickevents on the View
///</summary>
var AdminpageMain = /** @class */ (function () {
    function AdminpageMain() {
    }
    AdminpageMain.startApplication = function (waitcontrol) {
        waitcontrol.startWait();
        var adminController = new AdminpageController(waitcontrol);
        adminController.initializeAdminpage();
        AdminpageMain.setAdminController(adminController);
        generateCombos();
    };
    AdminpageMain.setMultipleVotes = function (isEnabled) {
        this.adminController.ActualVoting.IsMultipleVotingEnabled = isEnabled;
    };
    AdminpageMain.setLevel = function (level) {
        this.adminController.ActualVoting.Level = level;
    };
    AdminpageMain.setDescription = function (description) {
        this.adminController.ActualVoting.Description = description;
    };
    AdminpageMain.setTitle = function (title) {
        this.adminController.ActualVoting.Title = title;
    };
    AdminpageMain.setAdminController = function (value) {
        this.adminController = value;
        if (this.combos != undefined) {
            this.adminController.setCombos(this.combos[0], this.combos[1], this.combos[2], this.combos[3]);
        }
        this.userIsAdmin = true; // VSS.getWebContext().team.userIsAdmin;
    };
    AdminpageMain.saveClicked = function (value) {
        this.adminController.saveSettings(value);
    };
    AdminpageMain.votingEnabledClicked = function () {
        toggleActive();
        if ($("#content").hasClass("hide") == false) {
            var voting = this.adminController.ActualVoting;
            voting.Created = Math.round((new Date()).getTime() / 1000);
            this.adminController.ActualVoting = voting;
            createMenueBar("true");
        }
    };
    AdminpageMain.cancelClicked = function () {
        $('#content').toggleClass("hide", true);
        this.adminController.ActualVoting = new Voting();
        this.adminController.buildAdminpage();
    };
    AdminpageMain.loadExcludeList = function () {
        var excludes = this.adminController.getExcludes();
        var levels = this.adminController.getLevels();
        var excludeContainer = $("#excludeListbody");
        excludeContainer.empty();
        var includeContainer = $("#includeListbody");
        includeContainer.empty();
        var panel = $("div[name='itemPanel']");
        $.each(excludes, function (index, item) {
            var panelnew = panel.clone();
            panelnew.show();
            panelnew.attr("id", item.replace(/\s+/g, ''));
            panelnew.children(".panel-body").html(item);
            excludeContainer.append(panelnew);
        });
        $.each(levels, function (index, item) {
            var panelnew = panel.clone();
            panelnew.attr("id", item.replace(/\s+/g, ''));
            panelnew.show();
            panelnew.children(".panel-body").html(item);
            includeContainer.append(panelnew);
        });
    };
    AdminpageMain.getMenuItems = function (isActive) {
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
    };
    AdminpageMain.showInfo = function () {
        showInfoDialog();
    };
    AdminpageMain.setCombos = function (title, description, multipleVotes, level) {
        if (this.adminController != undefined) {
            this.adminController.setCombos(title, description, multipleVotes, level);
        }
        else {
            this.combos = [title, description, multipleVotes, level];
        }
    };
    AdminpageMain.addToExcludeList = function (item) {
        this.adminController.addToExclude(item);
    };
    AdminpageMain.addToIncludeList = function (item) {
        this.adminController.addToInclude(item);
    };
    AdminpageMain.changeProcess = function () {
        this.adminController.changeProcess($("#process").val());
    };
    return AdminpageMain;
}());
