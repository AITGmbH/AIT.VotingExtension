/// <reference types="vss-web-extension-sdk" />
///<summary>
///Controller class with functions which 
///are used by the VotingpageDataController
///and also by the AdminpageDataController
///</summary>
var BasicDataController = /** @class */ (function () {
    function BasicDataController() {
        this.excludes = new Array();
        this.process = "Agile";
    }
    //Method to get the WebContext Information
    BasicDataController.prototype.loadWebContext = function () {
        this.webContext = VSS.getWebContext();
        this.extensionContext = VSS.getExtensionContext();
    };
    BasicDataController.prototype.getWebContext = function () {
        return this.webContext;
    };
    BasicDataController.prototype.setDocumentId = function (teamId) {
        this.documentId = this.extensionContext.extensionId + "_" + teamId;
    };
    BasicDataController.prototype.getDocumentId = function () {
        return this.documentId;
    };
    BasicDataController.prototype.getWITFieldNames = function () {
        var _this = this;
        if (this.witFieldNames != undefined) {
            return this.witFieldNames;
        }
        async.series([function (callback) { _this.loadWITFieldNames(callback); }], function (err) {
            if (err != null) {
                LogExtension.log(err);
                return new Error("noFields");
            }
            else {
                return _this.witFieldNames;
            }
        });
    };
    BasicDataController.prototype.getTemplate = function () {
        return this.process;
    };
    BasicDataController.prototype.getSettings = function () {
        return this.actualSetting;
    };
    BasicDataController.prototype.reload = function () {
        window.location.href = window.location.href;
    };
    //Method to load all WorkItemTypes in the actual Project
    BasicDataController.prototype.loadWITFieldNames = function (asyncCallback) {
        var _this = this;
        VSS.require(["TFS/WorkItemTracking/RestClient", "TFS/Core/RestClient"], function (client, coreClient) {
            var witclient = client.getClient();
            witclient.getWorkItemTypes(_this.webContext.project.id).then(function (witcat) {
                _this.witFieldNames = new Array();
                $.each(witcat, function (ix, cat) {
                    if (_this.excludes.indexOf(cat.name) < 0) {
                        _this.witFieldNames.push(cat.name);
                        //this.witFieldNames2.push(cat.name);
                    }
                });
                LogExtension.log(_this.witFieldNames);
                asyncCallback();
            }, function (error) {
                LogExtension.log(error);
                asyncCallback(error);
            });
        });
    };
    BasicDataController.prototype.getExcludes = function () {
        return this.excludes;
    };
    //Method to load the stored Settings for Adminpage and store them temporary in 
    //Voting-Objects to work with
    BasicDataController.prototype.loadVoting = function (asyncCallback) {
        var _this = this;
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function (service) {
            service.getDocument(_this.webContext.collection.name, _this.documentId).then(function (doc) {
                LogExtension.log(doc);
                var votingArray;
                if (JSON.stringify(doc.voting) == "[]") {
                    _this.actualSetting = new Voting();
                    return asyncCallback(new Error("noVotingActive"));
                }
                else {
                    if (!!doc.excludes) {
                        $.each(doc.excludes, function (index, data) {
                            _this.excludes.push(data);
                            if (_this.witFieldNames != undefined) {
                                _this.witFieldNames.splice(_this.witFieldNames.indexOf(data), 1);
                            }
                        });
                    }
                    if (!!doc.process) {
                        _this.process = doc.process;
                        $("#process").val(_this.process);
                    }
                    votingArray = new Array();
                    $.each(doc.voting, function (index, data) {
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
                            _this.actualSetting = actualVoting;
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
            }, function (error) {
                LogExtension.log("Error occured: ", error);
                return asyncCallback(new Error("noVoting"));
            });
        });
    };
    return BasicDataController;
}());
