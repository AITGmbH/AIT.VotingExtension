/// <reference types="vss-web-extension-sdk" />

///<summary>
///Controller class with functions which 
///are used by the VotingpageDataController
///and also by the AdminpageDataController
///</summary>
class BasicDataController {
    protected documentId: string;
    protected excludes: Array<string>;
    protected actualSetting: Voting;
    protected webContext: WebContext;
    protected template: string;
    protected witFieldNames: Array<string>;
    protected witFieldNames2: Array<string>;
    private extensionContext: IExtensionContext;
    protected process: string;

    constructor() {
        this.excludes = new Array<string>();
        this.process = "Agile";
    }

    //Method to get the WebContext Information
    public loadWebContext(){
        this.webContext = VSS.getWebContext();
        this.extensionContext = VSS.getExtensionContext();
    }

    public getWebContext(): WebContext {
        return this.webContext;
    }

    public setDocumentId(teamId: string) {
        this.documentId = this.extensionContext.extensionId + "_" + teamId;
    }
    public getDocumentId() {
        return this.documentId ;
    }

    public getWITFieldNames() {
        if (this.witFieldNames != undefined) {
            return this.witFieldNames;
        }
        async.series([(callback) => { this.loadWITFieldNames(callback); }],
            (err: Error) => {
                if (err != null) {
                    LogExtension.log(err);
                    return new Error("noFields");
                }
                else {
                    return this.witFieldNames;
                }
            });
    }
    public getTemplate(): string {  
        return this.process;
    }

    public getSettings(): Voting {
        return this.actualSetting;
    }

    public reload() {
        window.location.href = window.location.href;
    }

    //Method to load all WorkItemTypes in the actual Project
    public loadWITFieldNames(asyncCallback) {
        VSS.require(["TFS/WorkItemTracking/RestClient", "TFS/Core/RestClient"], (client, coreClient) => {
            var witclient = client.getClient();


            witclient.getWorkItemTypes(this.webContext.project.id).then((witcat) => {
                this.witFieldNames = new Array<string>();
                $.each(witcat, (ix, cat) => {
                    if (this.excludes.indexOf(cat.name) < 0) {
                        this.witFieldNames.push(cat.name);
                        //this.witFieldNames2.push(cat.name);
                    }
                });
                LogExtension.log(this.witFieldNames);
                asyncCallback();
            }, (error) => {
                LogExtension.log(error);
                asyncCallback(error);   
                });
        });
    }

    public getExcludes(): Array<string> {
        return this.excludes;
    }

    //Method to load the stored Settings for Adminpage and store them temporary in 
    //Voting-Objects to work with
    public loadVoting(asyncCallback) {
        VSS.getService(VSS.ServiceIds.ExtensionData).then((service: IExtensionDataService) => {
            service.getDocument(this.webContext.collection.name, this.documentId).then((doc) => {
                LogExtension.log(doc);
                var votingArray: Array<Voting>;
                if (JSON.stringify(doc.voting) == "[]") {
                    this.actualSetting = new Voting();
                    return asyncCallback(new Error("noVotingActive"));
                }
                else {
                    if (!!doc.excludes) {
                        $.each(doc.excludes, (index, data) => {
                            this.excludes.push(data);
                            if (this.witFieldNames != undefined) {
                                this.witFieldNames.splice(this.witFieldNames.indexOf(data), 1);
                            } 
                        });
                    }
                    if (!!doc.process) {
                        this.process = doc.process;
                        $("#process").val(this.process);
                    } 
                    votingArray = new Array<Voting>();
                    $.each(doc.voting, (index, data) => {
                        var temp = new Voting();                     
                        //store the Item in fields of the Object
                        temp.Created = parseInt(data.created);
                        temp.LastModified = parseInt(data.lastModified);
                        temp.Title = data.title;
                        temp.Description = data.description;
                        temp.Group = data.group;
                        temp.Team = data.team;
                        temp.NumberOfVotes = parseInt(data.numberOfVotes);
                        temp.Level = data.level;
                        if (data.votingEnabled.toString() == "true") {
                            temp.IsVotingEnabled = true;
                        }
                        if (data.multipleVoting.toString() == "true") {
                            temp.IsMultipleVotingEnabled = true;
                        }
                        if (data.showResult.toString() == "true") {
                            temp.IsShowResultsEnabled = true;
                        }
                        //add the Voting-Object to the Array
                        votingArray.push(temp);
                    });
                    LogExtension.log("after each");
                    //If there are more than 1 Voting for the Team of the actual User
                    //take the newest (lastModified)
                    if (votingArray.length >= 1) {
                        LogExtension.log("more than one voting");
                        var actualVoting = votingArray[0];
                        for (var i = 1; i < votingArray.length; i++) {
                            if (actualVoting.LastModified < votingArray[i].LastModified) {
                                actualVoting = votingArray[i];
                            }
                        }
                        if (actualVoting.IsVotingEnabled) {
                            LogExtension.log(actualVoting.IsVotingEnabled);
                            this.actualSetting = actualVoting;
                            return asyncCallback();
                        }
                        else {
                            LogExtension.log("voting inactive");
                            return asyncCallback(new Error("noVotingActive"));
                        }
                    }
                    else {
                        return asyncCallback(new Error("noVotingActive"));
                    }
                }
            }, (error) => {
                LogExtension.log("Error occured: ", error);
                return asyncCallback(new Error("noVoting"));
            });
        });
    }
}