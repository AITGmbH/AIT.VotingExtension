/// <reference path="../Entities/Voting.ts"/>
/// <reference path="../Entities/User.ts"/>
/// <reference types="jquery" />
/// <reference path="AdminpageDataController.ts"/>
/// <reference path="VotingpageDataController.ts"/>
/// <reference path="BasicController.ts"/>
/// <reference path="../Services/IReportCreationService.ts"/>
/// <reference path="../Services/ReportCreationService.ts"/>
/// <reference path="../Services/IEmailService.ts"/>
/// <reference path="../Services/EmailService.ts"/>
/// <reference path="IReportView.ts"/>
/// <reference path="../Services/VssVotingDataService.ts"/>

//here the functions which are implemented in the HTML-Body
//are declared, this is nessesary to use them in TypeScript

declare function fillSettingsTable(data: any);
declare function createMenueBar(isActive: boolean);
declare function generateCombos();
declare function toggleActive();
declare function toggleReadOnly(isDisabled: boolean);
declare function bsNotify(type: string, message: string);

///<summary>
/// Controller Class with temporary Data and functions
/// to call the Api-functions and also functions to build
/// the HTML View
///</summary>
class AdminpageController extends BasicController {
    
    private dataController: AdminpageDataController;
    private optionvalue: string = null;
    private title: any;
    private description: any;
    private multipleVotesCombo: any;
    private levelCombo: any;
    private levels: string[];
    private waitControl: any;

    private reportCreator: IReportCreationService;
    private emailService: EmailService;
    private reportview: IReportView;

    constructor(waitcontrol: any, reportview: IReportView, dataService: VssVotingDataService, votingpagedataservice : VotingpageDataController) {
        super();
        this.reportview = reportview;
        this.waitControl = waitcontrol;
        this.dataController = new AdminpageDataController();
        this.reportCreator = new ReportCreationService(dataService, votingpagedataservice);
        this.emailService = new EmailService();
    }

    //"start" of the Adminpage
    public initializeAdminpage(): void {
        this.dataController.loadWebContext();
        this.dataController.setDocumentId(this.dataController.getWebContext().team.id);
        async.parallel([
            (asyncCallback) => {
                this.dataController.loadVoting(asyncCallback);
            },
            (asyncCallback) => {
                this.dataController.loadWITFieldNames(asyncCallback);
            }
        ], (err: Error) => {
            if (err == null) {
                this.actualVoting = this.dataController.getSettings();
                this.initializeLevelDropDown();
                this.buildAdminpage();
                this.waitControl.endWait();
            }
            else {
                switch (err.message) {
                    case "noVoting":
                        async.parallel(
                            [(asyncCallback) => {
                                this.dataController.createNewVoting(asyncCallback);
                            },
                            (asyncCallback) => {
                                this.dataController.loadWITFieldNames(asyncCallback);
                            }], (err: Error) => {
                                if (err != null) {
                                    LogExtension.log("Error:", err);
                                }
                            });
                        break;
                    case "noVotingActive":
                        this.ActualVoting = new Voting();
                        break;
                }
                this.actualVoting = this.dataController.getSettings();
                this.initializeLevelDropDown();
                this.buildAdminpage();
                this.waitControl.endWait();
            }
        });
    }

    public initializeLevelDropDown() {
        var fieldNames = this.dataController.getWITFieldNames();
        LogExtension.log("fieldNames:", fieldNames);
        if (fieldNames != undefined) {
            this.levels = fieldNames;
        }
        if (this.actualVoting == undefined) {
            this.levelCombo.setText(this.levels[0]);
        } else {
            this.levelCombo.setText(this.actualVoting.Level);
        }
    }

    //function to set the actual Voting on the View and load the Informations
    //for the Settings-Table, if there is no actual Voting, show default values
    public buildAdminpage() {
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
        else {//no active Voting
            this.actualVoting = new Voting();
            this.title.setInvalid(true);
            this.levelCombo.setText(this.levels[0]);
            $('#errorMessage').toggleClass("hide", false);
            $("#content").toggleClass("hide", true);
        }
        LogExtension.log("finished initializing");
        createMenueBar(false);
        this.createReport();

    }

    private removeRightAngleBrackets(s: string): string {
        //workaround string replaceAll()
        for (var i = 0; i < s.length; i++) {
            s = s.replace("<", "");
            s = s.replace(">", "");
        }
        return s;
    }

    //function to collect the values in the View and
    // create a string to call the Api-function to store
    // the data into the document
    public saveSettings(isEnabled: string): void {
        var voting: string = "";
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
            createMenueBar(false);
        }
    }

    public resetAdminpage() {
        LogExtension.log("reset the Adminpage");
        this.actualVoting = new Voting();
        this.title.setText("");
        this.title.setInvalid(true);
        this.description.setText("");
        this.setEditable(true);
        this.levelCombo.setText(this.levels[0]);
        LogExtension.log("finished resetting");
    }

    public abortVotingSettings() {

        this.resetAdminpage();
        this.createReport();
        this.sendReportToEmail();
        this.buildAdminpage();
    }

    //Sets the html-Element to local variables
    public setCombos(title, description, multipleVotes, level) {
        this.title = title;
        this.description = description;
        this.multipleVotesCombo = multipleVotes;
        this.levelCombo = level;
    }

    private setEditable(isEnabled: boolean) {
        this.multipleVotesCombo.setEnabled(isEnabled);
        this.levelCombo.setEnabled(isEnabled);
    }

    public getExcludes(): string[] {
        return this.dataController.getExcludes();
    }

    public getLevels(): string[] {
        return this.levels;
    }

    public addToExclude(item: string) {
        this.dataController.addToExclude(item);
        this.initializeLevelDropDown();
    }

    public addToInclude(item: string) {
        this.dataController.addToInclude(item);
        this.initializeLevelDropDown();
    }

    public changeProcess(process: string) {
        this.dataController.changeProcess(process);
    }

    private createReport() {
        console.debug("Initialize Report-creation");

        var container = this.reportview.getReportContainer();

        this.reportCreator.createReport(container, this.actualVoting);

        //.then((report) => {
        //    console.debug("Wait for Report");
        //    this.reportview.setReport(report);
        //}).catch((r) => {
        //    console.debug("Report-creation fails");
        //});

        console.debug("Report-creation done");
    }

    private sendReportToEmail() { throw new Error("Not implemented"); }
}