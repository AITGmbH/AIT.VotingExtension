///<reference path="VotingpageDataController.ts"/>
///<reference path="../Entities/User.ts"/>
///<reference path="../Entities/VotingItem.ts"/>
///<reference path="BasicController.ts"/>
///<reference path="../Services/IVotingDataService.ts"/>
///<reference path="../Services/VssVotingDataService.ts"/>

declare function createVotingTable();
declare function createVotingMenue();
declare function showErrorDialog(msg: string);
declare function userFeedback(msg: string);
///<summary>
/// Controller Class with temporary data, functions to call the api
/// and functions to build the Votingpage HTML View
///</summary>
class VotingpageController extends BasicController {
    private dataController: VotingpageDataController;
    private remainingVotes: number;
    private myVotes: Array<Vote>;
    private allVotes: Array<Vote>;
    private actualVotingItems: Array<VotingItem>;
    private grid: any;
    private waitControl: any;
    private lockButtons: boolean;
    private votingDataService: IVotingDataService;

    constructor(waitControl: any) {
        super();
        this.waitControl = waitControl;
        this.votingDataService = new VssVotingDataService();
        this.dataController = new VotingpageDataController(this, this.votingDataService);
    }

    public getActualVotingItems(): Array<VotingItem> {
        return this.actualVotingItems;
    }

    //"start" of the Votingpage
    public initializeVotingpage() {
        this.dataController.loadWebContext();
        this.setAttributes(this.dataController.getWebContext());
        this.dataController.setDocumentId(this.dataController.getWebContext().team.id);
        async.series([
            (asyncCallback) => {
                LogExtension.log("loadVoting");
                this.dataController.loadVoting(asyncCallback);
            },
            (asyncCallback) => {
                LogExtension.log("loadVotes");
                this.dataController.loadVotes(asyncCallback);
            },
            (asyncCallback) => {
                LogExtension.log("getAreas");
                this.dataController.getAreas(asyncCallback);
            },
            (asyncCallback) => {
                LogExtension.log("loadRequirements");
                this.dataController.loadRequirements(asyncCallback);
            }
        ], (err: Error) => {
            if (err == null) {
                this.actualVoting = this.dataController.getSettings();
                this.calculating();
                this.buildVotingTable();
                this.nothingToVote(true);
            }
            else {
                LogExtension.log("Error occured: " + err);
                switch (err.message) {
                    case "noVotingActive":
                        this.votingInactive();
                        break;
                    case "noVoting":
                        this.votingInactive();
                        break;
                    case "nothingToVote":
                        this.nothingToVote(false);
                        break;
                }
            }
        });
    } 

    //calculate the remaining votes and myVotes
    //also store the votes in the allVotes-Array
    //given are the votes which were stored in the document
    public calculating() {
        this.remainingVotes = this.actualVoting.NumberOfVotes;
        this.myVotes = new Array<Vote>();
        this.allVotes = new Array<Vote>();
        if (this.dataController.getVotes() != undefined) {
            $.each(this.dataController.getVotes(), (index, item) => {
                if (parseInt(item.VotingId) == this.actualVoting.Created) {
                    this.allVotes.push(item);
                }
            });
        }
    }
    
    //generate VotingItems for the table from requirements
    //-> set allVotes and myVotes
    public calculateMyVotes() {
        this.actualVotingItems = new Array<VotingItem>();
        $.each(this.dataController.getRequirements(), (index, reqItem) => {
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

            if (this.allVotes != undefined) {
                $.each(this.allVotes, (i, vote) => {
                    if (vote.WorkItemId == reqItem.Id) {
                        votingItemTemp.AllVotes++;
                        //check if the User has already voted for this Item
                        if (vote.UserId == this.user.Id) {
                            this.myVotes.push(vote)
                            this.remainingVotes--;
                            votingItemTemp.MyVotes++;
                        }
                    }
                });
            }
            LogExtension.log(votingItemTemp);
            this.actualVotingItems.push(votingItemTemp);
        });
        LogExtension.log("finished calculating MyVotes");
        return;
    }

    //show the remaining votes
    public displayRemainingVotes() {
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
    }

    //store the given Requirements in a VotingItem-Object 
    //to show them in the table on the View
    public buildVotingTable() {
        this.actualVotingItems = new Array<VotingItem>();
        this.calculateMyVotes();
        this.displayRemainingVotes();
        LogExtension.log("set Data");
        this.grid.setDataSource(this.actualVotingItems);
        this.lockButtons = false;
        LogExtension.log("Data online");
        if (this.user.IsAdmin) {
            createVotingMenue();
        }
    }

    //setter for the grid  = table
    //necessary to set data source
    public setGrid(grid) {
        this.grid = grid;
        this.lockButtons = false;
    }

    //get the attributes of the actual voting
    //display title and description
    public setVotingSettings() {
        if (this.actualVoting == undefined) {
            this.actualVoting = new Voting();
        }
        if (this.actualVoting.Title != undefined) {
            $("#titleDiv").html("<p>" + this.actualVoting.Title + "</p>");
        }
        if (this.actualVoting.Description != undefined) {
            $("#informationDiv").html("<p>" + this.actualVoting.Description + "</p>");
        }
    }

    //if voting inactive, show error message
    public votingInactive() {
        $("#contentVotingActive").toggleClass("hide");
        $("#contentVotingInactive").toggleClass("hide");
        this.waitControl.endWait();
    }

    //get all needed information to save the vote
    //give the information to datacontroller
    public saveVoting(id: string, upVote: boolean) {
        if (upVote) {
            $.each(this.actualVotingItems, (index, item) => {
                if (item.Id == id) {
                    var newId: number = 0;
                    if (this.allVotes != undefined) {
                        newId = this.allVotes.length;
                    }
                    var vote = '{"id": "' + newId.toString()
                        + '","userId": "' + this.user.Id
                        + '","votingId": "' + this.actualVoting.Created
                        + '","workItemId": "' + id
                        + '"}';
                    this.dataController.saveVote(vote);
                }
            });
        }
        else {
            this.dataController.deleteVote(id, this.user.Id);
        }
    }

    //Getter -> returns remainigVotes
    public get RemainingVotes(): number {
        return this.remainingVotes;
    }

    //Getter -> returns number of votes
    public numberOfMyVotes(): number {
        return this.myVotes.length;
    }

    //get votingitem by id
    public actualVotingItem(id): VotingItem {
        var votingItem;
        $.each(this.actualVotingItems, (index, item) => {
            if (item.Id == id) {
                votingItem = item;
            }
        });
        return votingItem;
    }

    //shows item table or no items banner
    public nothingToVote(isThereAnythingToVote) {
        this.setVotingSettings();
        if (isThereAnythingToVote) {
            $('#grid-container').toggleClass("hide", false);
        }
        else {
            $('#nothingToVote').toggleClass("hide", false);
        }
        this.waitControl.endWait();
    }

    //apply to backlog clicked
    //call function in datacontroller
    public applyToBacklog() {
        this.dataController.applyToBacklog();
    }

    public get LockButtons(): boolean {
        return this.lockButtons;
    }

    public set LockButtons(value: boolean) {
        this.lockButtons = value;
    }

    public removeAllUservotes(): any {
        this.dataController.removeAllUservotes(this.user.Id);
    }
}