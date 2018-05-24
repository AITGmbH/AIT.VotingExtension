/// <reference types="jquery" />
///<reference path="../Entities/Vote.ts"/>
///<reference path="../Entities/TinyRequirement.ts"/>
///<reference path="../Entities/Voting.ts"/>
/// <reference types="vss-web-extension-sdk" />
///<reference path="BasicDataController.ts"/>
///<reference path="../"/>
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
///<summary>
/// Controller Class with api-functions
///</summary>
var VotingpageDataController = /** @class */ (function (_super) {
    __extends(VotingpageDataController, _super);
    function VotingpageDataController(controller, votingDataService) {
        var _this = _super.call(this) || this;
        _this.votingDataService = votingDataService;
        _this.votingController = controller;
        return _this;
    }
    VotingpageDataController.prototype.getVotes = function () {
        return this.votes;
    };
    VotingpageDataController.prototype.getRequirements = function () {
        return this.requirements;
    };
    //Method to load stored Votes for the Table on Votingpage
    //returns Array with Vote-Objects
    VotingpageDataController.prototype.loadVotes = function (asyncCallback) {
        var _this = this;
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function (service) {
            service.getDocument(_this.webContext.collection.name, _this.documentId).then(function (doc) {
                var tempArray = new Array();
                if (JSON.stringify(doc.vote) != "[]") {
                    $.each(doc.vote, function (index, vote) {
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
                _this.votes = tempArray;
                asyncCallback();
            });
        });
    };
    VotingpageDataController.prototype.getAreas = function (asyncCallback) {
        var _this = this;
        VSS.require(["VSS/Service", "TFS/Work/RestClient"], function (VSS_Service, TFS_Work_WebApi) {
            LogExtension.log("in require");
            var client = TFS_Work_WebApi.getClient();
            LogExtension.log("got REST-Client");
            var tempAreas = "AND ( ";
            var teamcontext = {
                projectId: _this.webContext.project.id,
                teamId: _this.webContext.team.id
            };
            client.getTeamFieldValues(teamcontext).then(function (teamfieldvalues) {
                LogExtension.log(teamfieldvalues);
                $.each(teamfieldvalues.values, function (index, value) {
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
                _this.areas = tempAreas;
                LogExtension.log("finish area");
                asyncCallback();
            });
        });
    };
    //Method to load the Requirements from TFS
    VotingpageDataController.prototype.loadRequirements = function (asyncCallback) {
        var _this = this;
        this.requirements = new Array();
        VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"], function (VSS_Service, TFS_Wit_WebApi) {
            var witClient = VSS_Service.getCollectionClient(TFS_Wit_WebApi.WorkItemTrackingHttpClient);
            //Getting all states, sort out 'Closed', 'Done', 'Removed' later
            //[System.State] <> 'Closed' AND [System.State] <> 'Done' AND [System.State] <> 'Removed' AND
            var wiql = "SELECT [System.Id] FROM WorkItems WHERE [System.State] <> 'Closed' AND [System.State] <> 'Done' AND [System.State] <> 'Removed'"
                + " AND [System.WorkItemType] = '" + _this.actualSetting.Level + "' " + _this.areas;
            var wiqlJson = {
                query: wiql
            };
            LogExtension.log("WIQL-Abfrage: " + wiql);
            witClient.queryByWiql(wiqlJson, _this.webContext.project.id).then(function (idJson) {
                LogExtension.log(idJson);
                var headArray = new Array();
                var tempArray = new Array();
                LogExtension.log(idJson.workItems);
                $.each(idJson.workItems, function (index, item) {
                    if ((index + 1) % 200 != 0) {
                        tempArray.push(item.id);
                    }
                    else {
                        headArray.push(tempArray);
                        tempArray = new Array();
                        tempArray.push(item.id);
                    }
                });
                headArray.push(tempArray);
                async.eachSeries(headArray, function (array, innerAsyncCallback) {
                    witClient.getWorkItems(array).then(function (result) {
                        $.each(result, function (index, req) {
                            LogExtension.log(req);
                            var tempRequirement = new TinyRequirement();
                            tempRequirement.Id = req.id;
                            if (req.fields['Microsoft.VSTS.Common.StackRank'] != undefined) {
                                tempRequirement.Order = req.fields['Microsoft.VSTS.Common.StackRank'];
                            }
                            else if (req.fields['Microsoft.VSTS.Common.BacklogPriority'] != undefined) {
                                tempRequirement.Order = req.fields['Microsoft.VSTS.Common.BacklogPriority'];
                            }
                            else {
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
                            _this.requirements.push(tempRequirement);
                        });
                        innerAsyncCallback();
                    }, function (error) {
                        LogExtension.log("Error at getWorkItems()");
                        LogExtension.log(error);
                        asyncCallback(new Error("nothingToVote"));
                    });
                }, function (err) {
                    if (err == null) {
                        asyncCallback();
                    }
                    else {
                        _this.votingController.nothingToVote(false);
                        asyncCallback(err);
                    }
                });
            }, function (error) {
                //No Items to vote
                _this.votingController.nothingToVote(false);
                asyncCallback(error);
            });
        });
    };
    //Method to store votes
    VotingpageDataController.prototype.saveVote = function (vote) {
        var _this = this;
        //setDocument with VSO-Api
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function (service) {
            service.getDocument(_this.webContext.collection.name, _this.documentId).then(function (doc) {
                var isEnabled;
                $.each(doc.voting, function (index, val) {
                    if (val.created == _this.actualSetting.Created) {
                        isEnabled = val.votingEnabled;
                    }
                });
                if (isEnabled == "true") {
                    var json = JSON.parse(vote);
                    var multipleVotes = false;
                    $.each(doc.vote, function (index, vote) {
                        if (vote.userId == json.userId && vote.votingId == json.votingId) {
                            if (vote.workItemId == json.workItemId) {
                                multipleVotes = true;
                            }
                        }
                    });
                    if ((_this.actualSetting.NumberOfVotes - _this.votingController.numberOfMyVotes()) < 1) {
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
                            service.updateDocument(_this.webContext.collection.name, doc).then(function (uDoc) {
                                LogExtension.log("saveVote: document updated", uDoc.id);
                                bsNotify("success", "Your vote has been saved.");
                                _this.votingController.initializeVotingpage();
                            });
                        }
                    }
                }
                else {
                    bsNotify("warning", "This voting has been stopped. \nPlease refresh your browser windot to get the actual content.");
                }
            }, function (error) {
                LogExtension.log(error);
            });
        });
    };
    //Method to delete single Vote from Document
    VotingpageDataController.prototype.deleteVote = function (id, userId) {
        var _this = this;
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function (service) {
            service.getDocument(_this.webContext.collection.name, _this.documentId).then(function (doc) {
                var isEnabled;
                $.each(doc.voting, function (index, val) {
                    if (val.created == _this.actualSetting.Created) {
                        isEnabled = val.votingEnabled;
                    }
                });
                if (isEnabled == "true") {
                    LogExtension.log("Item Id", id);
                    $.each(doc.vote, function (index, item) {
                        if (item.workItemId == id) {
                            LogExtension.log(item.workItemId, id);
                            if (item.userId == userId) {
                                doc.vote.splice(index, 1);
                                return false;
                            }
                        }
                    });
                    service.updateDocument(_this.webContext.collection.name, doc).then(function (uDoc) {
                        LogExtension.log("deleteVote: document updated", uDoc.id);
                        bsNotify("success", "Your vote has been deleted.");
                        _this.votingController.initializeVotingpage();
                    });
                }
                else {
                    bsNotify("warning", "This voting has been stopped. \nPlease refresh your browser windot to get the actual content.");
                }
            });
        });
    };
    VotingpageDataController.prototype.updateBacklog = function (wis, firstBacklogItem) {
        LogExtension.log("begin updating");
        var order;
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
        $.each(wis, function (idx, item) {
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
                function (callback) {
                    VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"], function (VSS_Service, TFS_Wit_WebApi) {
                        var witClient = TFS_Wit_WebApi.getClient();
                        witClient.updateWorkItem(newJson, item.Id).then(function (result) {
                            LogExtension.log("replace success: " + item.Id);
                            callback();
                        }, function (error) {
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
                            witClient.updateWorkItem(addJson, item.Id).then(function (result) {
                                LogExtension.log("add success: " + item.Id);
                                callback();
                            }, function (error) {
                                LogExtension.log(error);
                                callback(error);
                            });
                        });
                    });
                }
            ], function (err) {
                if (err != null) {
                    success = false;
                }
            });
        });
        if (success) {
            bsNotify("success", "Your Backlog has been successfully updated.");
        }
        else {
            bsNotify("danger", "An error occured.\nPlease refresh the page and try again");
        }
    };
    VotingpageDataController.prototype.applyToBacklog = function () {
        var _this = this;
        this.loadWebContext();
        async.series([
            function (asyncCallback) {
                _this.loadWITFieldNames(asyncCallback);
            },
            function (asyncCallback) {
                _this.loadVoting(asyncCallback);
            },
            function (asyncCallback) {
                _this.loadVotes(asyncCallback);
            },
            function (asyncCallback) {
                _this.getAreas(asyncCallback);
            },
            function (asyncCallback) {
                _this.loadRequirements(asyncCallback);
            }
        ], function (err) {
            if (err == null) {
                _this.votingController.calculating();
                _this.votingController.calculateMyVotes();
                var votingItems = _this.votingController.getActualVotingItems();
                LogExtension.log("VotingItems: ", votingItems);
                votingItems.sort(function (a, b) {
                    return parseInt(a.Order) - parseInt(b.Order);
                });
                var tempItem = votingItems[0];
                votingItems.sort(function (a, b) {
                    return a.AllVotes - b.AllVotes;
                });
                $.each(votingItems, function (idx, item) {
                    if (item.AllVotes > 0) {
                        votingItems.splice(0, idx);
                        return false;
                    }
                });
                _this.updateBacklog(votingItems, tempItem);
            }
            else {
                bsNotify("danger", "An error occured.\nPlease refresh the page and try again");
            }
        });
    };
    VotingpageDataController.prototype.removeAllUservotes = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var docs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.votingDataService.getAllVotings()];
                    case 1:
                        docs = _a.sent();
                        try {
                            $.each(docs, function (idx, doc) {
                                //remove votes if userid matches
                                doc.vote = doc.vote.filter(function (vote) { return vote.userId !== userId; });
                                //store document
                                _this.votingDataService.storeDocument(doc);
                                bsNotify("success", "Your votes has been successfully removes.");
                            });
                            this.votingController.initializeVotingpage();
                        }
                        catch (e) {
                            LogExtension.log(e);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return VotingpageDataController;
}(BasicDataController));
