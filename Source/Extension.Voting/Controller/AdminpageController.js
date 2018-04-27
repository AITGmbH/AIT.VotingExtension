///<reference path="../Entities/Voting.ts"/>
///<reference path="../Entities/User.ts"/>
/// <reference types="jquery" />
///<reference path="AdminpageDataController.ts"/>
///<reference path="BasicController.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
///<summary>
/// Controller Class with temporary Data and functions
/// to call the Api-functions and also functions to build
/// the HTML View
///</summary>
var AdminpageController = /** @class */ (function (_super) {
    __extends(AdminpageController, _super);
    function AdminpageController(waitcontrol) {
        var _this = _super.call(this) || this;
        _this.optionvalue = null;
        _this.waitControl = waitcontrol;
        _this.dataController = new AdminpageDataController(_this);
        return _this;
    }
    //"start" of the Adminpage
    AdminpageController.prototype.initializeAdminpage = function () {
        var _this = this;
        this.dataController.loadWebContext();
        this.dataController.setDocumentId(this.dataController.getWebContext().team.id);
        async.parallel([
            function (asyncCallback) {
                _this.dataController.loadVoting(asyncCallback);
            },
            function (asyncCallback) {
                _this.dataController.loadWITFieldNames(asyncCallback);
            }
        ], function (err) {
            if (err == null) {
                _this.actualVoting = _this.dataController.getSettings();
                _this.initializeLevelDropDown();
                _this.buildAdminpage();
                _this.waitControl.endWait();
            }
            else {
                switch (err.message) {
                    case "noVoting":
                        async.parallel([function (asyncCallback) {
                                _this.dataController.createNewVoting(asyncCallback);
                            },
                            function (asyncCallback) {
                                _this.dataController.loadWITFieldNames(asyncCallback);
                            }], function (err) {
                            if (err != null) {
                                LogExtension.log("Error:", err);
                            }
                        });
                        break;
                    case "noVotingActive":
                        _this.ActualVoting = new Voting();
                        break;
                }
                _this.actualVoting = _this.dataController.getSettings();
                _this.initializeLevelDropDown();
                _this.buildAdminpage();
                _this.waitControl.endWait();
            }
        });
    };
    AdminpageController.prototype.initializeLevelDropDown = function () {
        var fieldNames = this.dataController.getWITFieldNames();
        LogExtension.log("fieldNames:", fieldNames);
        if (fieldNames != undefined) {
            this.levels = fieldNames;
        }
        if (this.actualVoting == undefined) {
            this.levelCombo.setText(this.levels[0]);
        }
        else {
            this.levelCombo.setText(this.actualVoting.Level);
        }
    };
    //function to set the actual Voting on the View and load the Informations
    //for the Settings-Table, if there is no actual Voting, show default values
    AdminpageController.prototype.buildAdminpage = function () {
        if (this.levels != undefined) {
            this.levelCombo.setSource(this.levels);
        }
        LogExtension.log("set Voting level");
        if (this.actualVoting != undefined) {
            LogExtension.log("actual Voting found");
            //if actualVoting is enabled build Adminpage with given values
            if (this.actualVoting.IsVotingEnabled) {
                LogExtension.log("actual voting enabled");
                if ($("#content").hasClass("hide")) {
                    toggleActive();
                }
                this.setEditable(false);
                this.title.setText(this.actualVoting.Title);
                this.description.setText(this.actualVoting.Description);
                if (this.actualVoting.IsMultipleVotingEnabled) {
                    this.multipleVotesCombo.setText("Enabled");
                }
                else {
                    this.multipleVotesCombo.setText("Disabled");
                }
                this.levelCombo.setText(this.actualVoting.Level);
            }
            else {
                LogExtension.log("actual voting disabled");
                this.resetAdminpage();
                $('#errorMessage').toggleClass("hide", false);
            }
        }
        else { //no active Voting
            this.actualVoting = new Voting();
            this.title.setInvalid(true);
            this.levelCombo.setText(this.levels[0]);
            $('#errorMessage').toggleClass("hide", false);
            $("#content").toggleClass("hide", true);
        }
        LogExtension.log("finished initializing");
        createMenueBar("false");
    };
    AdminpageController.prototype.removeRightAngleBrackets = function (s) {
        //workaround string replaceAll()
        for (var i = 0; i < s.length; i++) {
            s = s.replace("<", "");
            s = s.replace(">", "");
        }
        return s;
    };
    //function to collect the values in the View and
    // create a string to call the Api-function to store
    // the data into the document
    AdminpageController.prototype.saveSettings = function (isEnabled) {
        var voting = "";
        var settings = this.actualVoting;
        settings.Title = this.removeRightAngleBrackets(settings.Title);
        if (settings.Title == undefined || settings.Title == "") {
            bsNotify("danger", "Please provide a title for the voting.");
            return;
        }
        settings.LastModified = Math.round((new Date()).getTime() / 1000);
        settings.Description = this.removeRightAngleBrackets(settings.Description);
        settings.Team = this.dataController.getWebContext().team.id;
        if (isEnabled == 'true') {
            settings.IsVotingEnabled = true;
        }
        else {
            settings.IsVotingEnabled = false;
            toggleActive();
        }
        LogExtension.log("Level:", settings.Level);
        if (settings.Level == undefined) {
            settings.Level = this.levelCombo.getText();
            LogExtension.log("New Level:", settings.Level);
        }
        //Generate string with values to store for the JSON file
        voting = '{"created": "' + settings.Created.toString()
            + '", "lastModified": "' + settings.LastModified.toString()
            + '", "title": "' + settings.Title
            + '", "description": "' + settings.Description
            + '", "votingEnabled": "' + settings.IsVotingEnabled
            + '", "numberOfVotes": "' + settings.NumberOfVotes.toString()
            + '", "multipleVoting": "' + settings.IsMultipleVotingEnabled
            + '", "showResult": "' + settings.IsShowResultsEnabled
            + '", "group": "' + settings.Group
            + '", "team": "' + settings.Team
            + '", "level": "' + settings.Level + '"}';
        this.dataController.saveVoting(voting, settings.IsVotingEnabled);
        if (settings.IsVotingEnabled) {
            this.actualVoting = settings;
            this.buildAdminpage();
        }
        else {
            this.resetAdminpage();
            createMenueBar("false");
        }
    };
    AdminpageController.prototype.resetAdminpage = function () {
        LogExtension.log("reset the Adminpage");
        this.actualVoting = new Voting();
        this.title.setText("");
        this.title.setInvalid(true);
        this.description.setText("");
        this.setEditable(true);
        this.levelCombo.setText(this.levels[0]);
        LogExtension.log("finished resetting");
    };
    AdminpageController.prototype.abortVotingSettings = function () {
        this.resetAdminpage();
        this.buildAdminpage();
    };
    AdminpageController.prototype.setCombos = function (title, description, multipleVotes, level) {
        this.title = title;
        this.description = description;
        this.multipleVotesCombo = multipleVotes;
        this.levelCombo = level;
    };
    AdminpageController.prototype.setEditable = function (isEnabled) {
        this.multipleVotesCombo.setEnabled(isEnabled);
        this.levelCombo.setEnabled(isEnabled);
    };
    AdminpageController.prototype.getExcludes = function () {
        return this.dataController.getExcludes();
    };
    AdminpageController.prototype.getLevels = function () {
        return this.levels;
    };
    AdminpageController.prototype.addToExclude = function (item) {
        this.dataController.addToExclude(item);
        this.initializeLevelDropDown();
    };
    AdminpageController.prototype.addToInclude = function (item) {
        this.dataController.addToInclude(item);
        this.initializeLevelDropDown();
    };
    AdminpageController.prototype.changeProcess = function (process) {
        this.dataController.changeProcess(process);
    };
    return AdminpageController;
}(BasicController));
