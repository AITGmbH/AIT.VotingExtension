///<reference path="VotingpageDataController.ts"/>
///<reference path="../Entities/User.ts"/>
///<reference path="../Entities/VotingItem.ts"/>
///<reference path="BasicController.ts"/>
///<reference path="../Services/IVotingDataService.ts"/>
///<reference path="../Services/VssVotingDataService.ts"/>
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
/// Controller Class with temporary data, functions to call the api
/// and functions to build the Votingpage HTML View
///</summary>
var VotingpageController = /** @class */ (function (_super) {
    __extends(VotingpageController, _super);
    function VotingpageController(waitControl) {
        var _this = _super.call(this) || this;
        _this.waitControl = waitControl;
        _this.votingDataService = new VssVotingDataService();
        _this.dataController = new VotingpageDataController(_this, _this.votingDataService);
        return _this;
    }
    VotingpageController.prototype.getActualVotingItems = function () {
        return this.actualVotingItems;
    };
    //"start" of the Votingpage
    VotingpageController.prototype.initializeVotingpage = function () {
        var _this = this;
        this.dataController.loadWebContext();
        this.setAttributes(this.dataController.getWebContext());
        this.dataController.setDocumentId(this.dataController.getWebContext().team.id);
        async.series([
            function (asyncCallback) {
                LogExtension.log("loadVoting");
                _this.dataController.loadVoting(asyncCallback);
            },
            function (asyncCallback) {
                LogExtension.log("loadVotes");
                _this.dataController.loadVotes(asyncCallback);
            },
            function (asyncCallback) {
                LogExtension.log("getAreas");
                _this.dataController.getAreas(asyncCallback);
            },
            function (asyncCallback) {
                LogExtension.log("loadRequirements");
                _this.dataController.loadRequirements(asyncCallback);
            }
        ], function (err) {
            if (err == null) {
                _this.actualVoting = _this.dataController.getSettings();
                _this.calculating();
                _this.buildVotingTable();
                _this.nothingToVote(true);
            }
            else {
                LogExtension.log("Error occured: " + err);
                switch (err.message) {
                    case "noVotingActive":
                        _this.votingInactive();
                        break;
                    case "noVoting":
                        _this.votingInactive();
                        break;
                    case "nothingToVote":
                        _this.nothingToVote(false);
                        break;
                }
            }
        });
    };
    //calculate the remaining votes and myVotes
    //also store the votes in the allVotes-Array
    //given are the votes which were stored in the document
    VotingpageController.prototype.calculating = function () {
        var _this = this;
        this.remainingVotes = this.actualVoting.NumberOfVotes;
        this.myVotes = new Array();
        this.allVotes = new Array();
        if (this.dataController.getVotes() != undefined) {
            $.each(this.dataController.getVotes(), function (index, item) {
                if (parseInt(item.VotingId) == _this.actualVoting.Created) {
                    _this.allVotes.push(item);
                }
            });
        }
    };
    //generate VotingItems for the table from requirements
    //-> set allVotes and myVotes
    VotingpageController.prototype.calculateMyVotes = function () {
        var _this = this;
        this.actualVotingItems = new Array();
        $.each(this.dataController.getRequirements(), function (index, reqItem) {
            var votingItemTemp = new VotingItem();
            votingItemTemp.Id = reqItem.Id;
            votingItemTemp.Order = reqItem.Order;
            votingItemTemp.Title = reqItem.Title;
            votingItemTemp.WorkItemType = reqItem.WorkItemType;
            votingItemTemp.ValueArea = reqItem.ValueArea;
            votingItemTemp.RequirementType = reqItem.RequirementType;
            votingItemTemp.State = reqItem.State;
            votingItemTemp.Size = reqItem.Size;
            votingItemTemp.IterationPath = reqItem.IterationPath;
            votingItemTemp.AssignedTo = reqItem.AssignedTo;
            votingItemTemp.MyVotes = 0;
            votingItemTemp.AllVotes = 0;
            if (_this.allVotes != undefined) {
                $.each(_this.allVotes, function (i, vote) {
                    if (vote.WorkItemId == reqItem.Id) {
                        votingItemTemp.AllVotes++;
                        //check if the User has already voted for this Item
                        if (vote.UserId == _this.user.Id) {
                            _this.myVotes.push(vote);
                            _this.remainingVotes--;
                            votingItemTemp.MyVotes++;
                        }
                    }
                });
            }
            LogExtension.log(votingItemTemp);
            _this.actualVotingItems.push(votingItemTemp);
        });
        LogExtension.log("finished calculating MyVotes");
        return;
    };
    //show the remaining votes
    VotingpageController.prototype.displayRemainingVotes = function () {
        switch (this.remainingVotes) {
            case 0:
                $("#remainingVotesDiv").html("<p>You have no votes left</p>");
                break;
            case 1:
                $("#remainingVotesDiv").html("<p>You have 1 vote left</p>");
                break;
            default:
                $("#remainingVotesDiv").html("<p>You have " + this.remainingVotes + " votes left</p>");
                break;
        }
    };
    //store the given Requirements in a VotingItem-Object 
    //to show them in the table on the View
    VotingpageController.prototype.buildVotingTable = function () {
        this.actualVotingItems = new Array();
        this.calculateMyVotes();
        this.displayRemainingVotes();
        LogExtension.log("set Data");
        this.grid.setDataSource(this.actualVotingItems);
        this.lockButtons = false;
        LogExtension.log("Data online");
        if (this.user.IsAdmin) {
            createVotingMenue();
        }
    };
    //setter for the grid  = table
    //necessary to set data source
    VotingpageController.prototype.setGrid = function (grid) {
        this.grid = grid;
        this.lockButtons = false;
    };
    //get the attributes of the actual voting
    //display title and description
    VotingpageController.prototype.setVotingSettings = function () {
        if (this.actualVoting == undefined) {
            this.actualVoting = new Voting();
        }
        if (this.actualVoting.Title != undefined) {
            $("#titleDiv").html("<p>" + this.actualVoting.Title + "</p>");
        }
        if (this.actualVoting.Description != undefined) {
            $("#informationDiv").html("<p>" + this.actualVoting.Description + "</p>");
        }
    };
    //if voting inactive, show error message
    VotingpageController.prototype.votingInactive = function () {
        $("#contentVotingActive").toggleClass("hide");
        $("#contentVotingInactive").toggleClass("hide");
        this.waitControl.endWait();
    };
    //get all needed information to save the vote
    //give the information to datacontroller
    VotingpageController.prototype.saveVoting = function (id, upVote) {
        var _this = this;
        if (upVote) {
            $.each(this.actualVotingItems, function (index, item) {
                if (item.Id == id) {
                    var newId = 0;
                    if (_this.allVotes != undefined) {
                        newId = _this.allVotes.length;
                    }
                    var vote = '{"id": "' + newId.toString()
                        + '","userId": "' + _this.user.Id
                        + '","votingId": "' + _this.actualVoting.Created
                        + '","workItemId": "' + id
                        + '"}';
                    _this.dataController.saveVote(vote);
                }
            });
        }
        else {
            this.dataController.deleteVote(id, this.user.Id);
        }
    };
    Object.defineProperty(VotingpageController.prototype, "RemainingVotes", {
        //Getter -> returns remainigVotes
        get: function () {
            return this.remainingVotes;
        },
        enumerable: true,
        configurable: true
    });
    //Getter -> returns number of votes
    VotingpageController.prototype.numberOfMyVotes = function () {
        return this.myVotes.length;
    };
    //get votingitem by id
    VotingpageController.prototype.actualVotingItem = function (id) {
        var votingItem;
        $.each(this.actualVotingItems, function (index, item) {
            if (item.Id == id) {
                votingItem = item;
            }
        });
        return votingItem;
    };
    //shows item table or no items banner
    VotingpageController.prototype.nothingToVote = function (isThereAnythingToVote) {
        this.setVotingSettings();
        if (isThereAnythingToVote) {
            $('#grid-container').toggleClass("hide", false);
        }
        else {
            $('#nothingToVote').toggleClass("hide", false);
        }
        this.waitControl.endWait();
    };
    //apply to backlog clicked
    //call function in datacontroller
    VotingpageController.prototype.applyToBacklog = function () {
        this.dataController.applyToBacklog();
    };
    Object.defineProperty(VotingpageController.prototype, "LockButtons", {
        get: function () {
            return this.lockButtons;
        },
        set: function (value) {
            this.lockButtons = value;
        },
        enumerable: true,
        configurable: true
    });
    VotingpageController.prototype.removeAllUservotes = function () {
        this.dataController.removeAllUservotes(this.user.Id);
    };
    return VotingpageController;
}(BasicController));
