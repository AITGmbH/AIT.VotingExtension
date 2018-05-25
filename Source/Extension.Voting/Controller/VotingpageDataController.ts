/// <reference types="jquery" />
///<reference path="../Entities/Vote.ts"/>
///<reference path="../Entities/TinyRequirement.ts"/>
///<reference path="../Entities/Voting.ts"/>
/// <reference types="vss-web-extension-sdk" />
///<reference path="BasicDataController.ts"/>


declare function bsNotify(type, message);
///<summary>
/// Controller Class with api-functions
///</summary>
class VotingpageDataController extends BasicDataController {
    private votingDataService: IVotingDataService;
    private votingController: VotingpageController;
    private votes: Array<Vote>;
    private areas: string;
    private requirements: Array<TinyRequirement>;

    constructor(controller: VotingpageController, votingDataService: IVotingDataService) {
        super();
        this.votingDataService = votingDataService;
        this.votingController = controller;
    }

    public getVotes(): Array<Vote> {
        return this.votes;
    }

    public getRequirements(): Array<TinyRequirement> {
        return this.requirements;
    }

    //Method to load stored Votes for the Table on Votingpage
    //returns Array with Vote-Objects
    public loadVotes(asyncCallback) {
        VSS.getService(VSS.ServiceIds.ExtensionData).then((service: IExtensionDataService) => {
            service.getDocument(this.webContext.collection.name, this.documentId).then((doc) => {
                var tempArray = new Array<Vote>();
                if (JSON.stringify(doc.vote) != "[]") {
                    $.each(doc.vote, (index, vote) => {
                        //create new vote-Object
                        var newVote = new Vote();
                        //store data in vote-Object
                        newVote.Id = parseInt(vote.id);
                        newVote.UserId = vote.userId;
                        newVote.VotingId = vote.votingId;
                        newVote.WorkItemId = vote.workItemId;
                        //store vote-Object in array
                        tempArray.push(newVote);
                    });
                }
                this.votes = tempArray;
                asyncCallback();
            });
        });
    }

    public getAreas(asyncCallback) {
        VSS.require(["VSS/Service", "TFS/Work/RestClient"], (VSS_Service, TFS_Work_WebApi) => {
            LogExtension.log("in require");
            var client = TFS_Work_WebApi.getClient();
            LogExtension.log("got REST-Client");
            var tempAreas = "AND ( ";
            var teamcontext = {
                projectId: this.webContext.project.id,
                teamId: this.webContext.team.id
            }
            client.getTeamFieldValues(teamcontext).then((teamfieldvalues) => {
                LogExtension.log(teamfieldvalues);
                $.each(teamfieldvalues.values, (index: number, value) => {
                    tempAreas += "[System.AreaPath] UNDER '";
                    tempAreas += value.value;
                    tempAreas += "'";
                    if (index < (teamfieldvalues.values.length - 1)) {
                        tempAreas += " OR ";
                    }
                    else {
                        tempAreas += " )";
                    }
                });
                LogExtension.log(tempAreas);
                this.areas = tempAreas;
                LogExtension.log("finish area");
                asyncCallback();
            });
        });
    }

    //Method to load the Requirements from TFS
    public loadRequirements(asyncCallback) {
        this.requirements = new Array<TinyRequirement>();
        VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"], (VSS_Service, TFS_Wit_WebApi) => {
            var witClient = VSS_Service.getCollectionClient(TFS_Wit_WebApi.WorkItemTrackingHttpClient);
            //Getting all states, sort out 'Closed', 'Done', 'Removed' later
            //[System.State] <> 'Closed' AND [System.State] <> 'Done' AND [System.State] <> 'Removed' AND
            var wiql = "SELECT [System.Id] FROM WorkItems WHERE [System.State] <> 'Closed' AND [System.State] <> 'Done' AND [System.State] <> 'Removed'"
                + " AND [System.WorkItemType] = '" + this.actualSetting.Level + "' " + this.areas;
            var wiqlJson = {
                query: wiql
            }
            LogExtension.log("WIQL-Abfrage: " + wiql);
            witClient.queryByWiql(wiqlJson, this.webContext.project.id).then((idJson) => {
                LogExtension.log(idJson);
                var headArray = new Array();
                var tempArray = new Array();
                LogExtension.log(idJson.workItems);
                $.each(idJson.workItems, (index: number, item) => {
                    if ((index + 1) % 200 != 0) {
                        tempArray.push(item.id);
                    }
                    else {
                        headArray.push(tempArray);
                        tempArray = new Array<string>();
                        tempArray.push(item.id);
                    }
                });
                headArray.push(tempArray);
                async.eachSeries(headArray, (array, innerAsyncCallback) => {
                    witClient.getWorkItems(array).then((result) => {
                        $.each(result, (index, req) => {
                            LogExtension.log(req);
                            var tempRequirement = new TinyRequirement();
                            tempRequirement.Id = req.id;
                            if (req.fields['Microsoft.VSTS.Common.StackRank'] != undefined) {
                                tempRequirement.Order = req.fields['Microsoft.VSTS.Common.StackRank'];
                            }
                            else if (req.fields['Microsoft.VSTS.Common.BacklogPriority'] != undefined) {
                                tempRequirement.Order = req.fields['Microsoft.VSTS.Common.BacklogPriority'];
                            } else {
                                tempRequirement.Order = "0";
                            }
                            tempRequirement.Title = req.fields['System.Title'];
                            tempRequirement.WorkItemType = req.fields['System.WorkItemType'];
                            tempRequirement.State = req.fields['System.State'];
                            tempRequirement.Size = req.fields['Microsoft.VSTS.Scheduling.Size'];
                            tempRequirement.ValueArea = req.fields['Microsoft.VSTS.Common.BusinessValue'];
                            tempRequirement.IterationPath = req.fields['System.IterationPath'];
                            tempRequirement.AssignedTo = req.fields['System.AssignedTo'];
                            tempRequirement.Description = req.fields['System.Description'];

                            this.requirements.push(tempRequirement);
                        });
                        innerAsyncCallback();
                    }, (error) => {
                        LogExtension.log("Error at getWorkItems()");
                        LogExtension.log(error);
                        asyncCallback(new Error("nothingToVote"));
                    });
                }, (err: Error) => {
                    if (err == null) {
                        asyncCallback();
                    }
                    else {
                        this.votingController.nothingToVote(false);
                        asyncCallback(err);
                    }
                });
            }, (error) => {
                //No Items to vote
                this.votingController.nothingToVote(false);
                asyncCallback(error);
            });
        });
    }

    //Method to store votes
    public saveVote(vote: string) {
        //setDocument with VSO-Api
        VSS.getService(VSS.ServiceIds.ExtensionData).then((service: IExtensionDataService) => {
            service.getDocument(this.webContext.collection.name, this.documentId).then((doc) => {
                var isEnabled;
                $.each(doc.voting, (index, val) => {
                    if (val.created == this.actualSetting.Created) {
                        isEnabled = val.votingEnabled;
                    }
                });
                if (isEnabled == "true") {
                    var json = JSON.parse(vote);
                    var multipleVotes = false;
                    $.each(doc.vote, (index, vote) => {
                        if (vote.userId == json.userId && vote.votingId == json.votingId) {
                            if (vote.workItemId == json.workItemId) {
                                multipleVotes = true;
                            }
                        }
                    });
                    if ((this.actualSetting.NumberOfVotes - this.votingController.numberOfMyVotes()) < 1) {
                        bsNotify("warning", "You have no vote remaining. \nPlease refresh your browser window to get the actual content.");
                        return;
                    }
                    else {
                        if (doc.voting.multipleVoting == "false" && multipleVotes) {
                            bsNotify("warning", "You cannot vote again for this Item. Please refresh your browser window to get the actual content.");
                            return;
                        }
                        else {
                            doc.vote.push(json);
                            service.updateDocument(this.webContext.collection.name, doc).then((uDoc) => {
                                LogExtension.log("saveVote: document updated", uDoc.id);
                                bsNotify("success", "Your vote has been saved.");
                                this.votingController.initializeVotingpage();
                            });
                        }
                    }
                }
                else {
                    bsNotify("warning", "This voting has been stopped. \nPlease refresh your browser windot to get the actual content.");
                }
            }, (error) => {
                LogExtension.log(error);
            });
        });
    }

    //Method to delete single Vote from Document
    public deleteVote(id: string, userId: string) {
        VSS.getService(VSS.ServiceIds.ExtensionData).then((service: IExtensionDataService) => {
            service.getDocument(this.webContext.collection.name, this.documentId).then((doc) => {
                var isEnabled;
                $.each(doc.voting, (index, val) => {
                    if (val.created == this.actualSetting.Created) {
                        isEnabled = val.votingEnabled;
                    }
                });
                if (isEnabled == "true") {
                    LogExtension.log("Item Id", id);
                    $.each(doc.vote, (index, item) => {
                        if (item.workItemId == id) {
                            LogExtension.log(item.workItemId, id);
                            if (item.userId == userId) {
                                doc.vote.splice(index, 1);
                                return false;
                            }
                        }
                    });
                    service.updateDocument(this.webContext.collection.name, doc).then((uDoc) => {
                        LogExtension.log("deleteVote: document updated", uDoc.id);
                        bsNotify("success", "Your vote has been deleted.");
                        this.votingController.initializeVotingpage();
                    });
                }
                else {
                    bsNotify("warning", "This voting has been stopped. \nPlease refresh your browser windot to get the actual content.");
                }
            });
        });
    }

    public updateBacklog(wis: Array<VotingItem>, firstBacklogItem: VotingItem) {
        LogExtension.log("begin updating");
        var order: String;
        var template = this.getTemplate();
        switch (template) {
            case "CMMI":
                order = "Microsoft.VSTS.Common.StackRank";
                break;
            case "Agile":
                order = "Microsoft.VSTS.Common.StackRank";
                break;
            case "Scrum":
                order = "Microsoft.VSTS.Common.BacklogPriority";
                break;
            default:
                order = "Microsoft.VSTS.Common.StackRank";
                break;
        }
        var success = true;
        $.each(wis, (idx, item) => {
            var newOrder = (parseInt(firstBacklogItem.Order) - (idx + 1));
            var comment = "Updated by AIT Voting Extension";
            var pathOrder = "/fields/" + order;
            var pathComment = "/fields/System.History";
            var newJson = [
                {
                    "op": "replace",
                    "path": pathOrder,
                    "value": newOrder
                },
                {
                    "op": "add",
                    "path": pathComment,
                    "value": comment
                }
            ];
            async.series([
                (callback) => {
                    VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"], (VSS_Service, TFS_Wit_WebApi) => {
                        var witClient = TFS_Wit_WebApi.getClient();
                        witClient.updateWorkItem(newJson, item.Id).then((result) => {
                            LogExtension.log("replace success: " + item.Id);
                            callback();
                        }, (error) => {
                            LogExtension.log("replace failed: " + item.Id + ", trying to add...");
                            var addJson = [
                                {
                                    "op": "add",
                                    "path": pathOrder,
                                    "value": newOrder
                                },
                                {
                                    "op": "add",
                                    "path": pathComment,
                                    "value": comment
                                }
                            ];
                            witClient.updateWorkItem(addJson, item.Id).then((result) => {
                                LogExtension.log("add success: " + item.Id);
                                callback();
                            }, (error) => {
                                LogExtension.log(error);
                                callback(error);
                            });
                        });
                    });
                }
            ], (err) => {
                if (err != null) {
                    success = false;
                }
            });
        });
        if (success) {
            bsNotify("success", "Your Backlog has been successfully updated.");
        } else {
            bsNotify("danger", "An error occured.\nPlease refresh the page and try again");
        }
    }

    public applyToBacklog() {
        this.loadWebContext();
        async.series([
            (asyncCallback) => {
                this.loadWITFieldNames(asyncCallback);
            },
            (asyncCallback) => {
                this.loadVoting(asyncCallback);
            },
            (asyncCallback) => {
                this.loadVotes(asyncCallback);
            },
            (asyncCallback) => {
                this.getAreas(asyncCallback);
            },
            (asyncCallback) => {
                this.loadRequirements(asyncCallback);
            }],
            (err: Error) => {
                if (err == null) {
                    this.votingController.calculating();
                    this.votingController.calculateMyVotes();

                    var votingItems = this.votingController.getActualVotingItems();
                    LogExtension.log("VotingItems: ", votingItems);
                    votingItems.sort((a, b) => {
                        return parseInt(a.Order) - parseInt(b.Order);
                    });
                    var tempItem = votingItems[0];
                    votingItems.sort((a, b) => {
                        return a.AllVotes - b.AllVotes;
                    });
                    $.each(votingItems, (idx, item) => {
                        if (item.AllVotes > 0) {
                            votingItems.splice(0, idx);
                            return false;
                        }
                    });
                    this.updateBacklog(votingItems, tempItem);
                }
                else {
                    bsNotify("danger", "An error occured.\nPlease refresh the page and try again");
                }
            });
    }

    public async removeAllUservotes(userId: string) {

        let docs = await this.votingDataService.getAllVotings();

        try {
            $.each(docs,
                (idx, doc) => {

                    //remove votes if userid matches
                    doc.vote = doc.vote.filter(vote => vote.userId !== userId);

                    //store document
                    this.votingDataService.storeDocument(doc);

                   
                    bsNotify("success", "Your votes has been successfully removes.");
                });
            this.votingController.initializeVotingpage();
        } catch (e) {
            LogExtension.log(e);
        }
    }
}