class ReportCreationService implements IReportCreationService {
    private votingdataservice: VotingpageDataController;
    private dataservice: IVotingDataService;

    constructor(dataservice: IVotingDataService, votingdataservice: VotingpageDataController) {
        this.votingdataservice = votingdataservice;
        this.dataservice = dataservice;
    }

    createReport(container: any, voting: Voting): void {

        this.createReportTable(container, voting);

    }

    private getNameOfWiResponsiveness(req: any): string {
        const assignedTo = req.fields["System.AssignedTo"];
        var displayName = (assignedTo == undefined) ? VotingpageDataController.assignedToUnassignedText : assignedTo.displayName;
        return displayName;
    };

    private createTinyRequirementFromAnnonymous(object): TinyRequirement {
        LogExtension.log(object);
        var tempRequirement = new TinyRequirement();
        tempRequirement.Id = object.id;
        if (object.fields['Microsoft.VSTS.Common.StackRank'] != undefined) {
            tempRequirement.Order = object.fields['Microsoft.VSTS.Common.StackRank'];
        }
        else if (object.fields['Microsoft.VSTS.Common.BacklogPriority'] != undefined) {
            tempRequirement.Order = object.fields['Microsoft.VSTS.Common.BacklogPriority'];
        } else {
            tempRequirement.Order = "0";
        }
        tempRequirement.Title = object.fields['System.Title'];
        tempRequirement.WorkItemType = object.fields['System.WorkItemType'];
        tempRequirement.State = object.fields['System.State'];
        tempRequirement.Size = object.fields['Microsoft.VSTS.Scheduling.Size'];
        tempRequirement.ValueArea = object.fields['Microsoft.VSTS.Common.BusinessValue'];
        tempRequirement.IterationPath = object.fields['System.IterationPath'];
        tempRequirement.AssignedTo = this.getNameOfWiResponsiveness(object);
        tempRequirement.Description = object.fields['System.Description'];

        return tempRequirement;
    };

    private createReportTable(container: any, voting: Voting) {

        this.dataservice.getTeamVoting(voting.Team).then((votingDoc) => {

            let workItemIdArray = this.getVotedObjectsFromVsts(votingDoc);
            let tinyItemArray: Array<TinyRequirement> = new Array<TinyRequirement>();

            VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"], (VSS_Service, TFS_Wit_WebApi) => {

                var witClient = VSS_Service.getCollectionClient(TFS_Wit_WebApi.WorkItemTrackingHttpClient);

                witClient.getWorkItems(workItemIdArray).then((workitem: any[]) => {

                    LogExtension.log(workitem);
                    workitem.forEach(w => {
                        let tinyItem = this.createTinyRequirementFromAnnonymous(w);
                        tinyItemArray.push(tinyItem);
                    });

                    this.generateGrid(container, tinyItemArray);

                });
            });
        });
    }

    private generateGrid(container: any, dataSource: TinyRequirement[]) {

        VSS.require(["VSS/Controls", "VSS/Controls/Grids"], (Controls, Grids) => {
            Controls.create(Grids.Grid, container,
                {
                    height: "400px",
                    allowMultiSelect: false,
                    source: dataSource,
                    columns: [
                        { title: "Work Item ID", text: "ID", index: "id", width: 50, id: "itemId" },
                        {
                            title: "Work Item Type",
                            text: "Work Item Type",
                            index: "workItemType",
                            width: 100
                        },
                        { title: "Work Item Title", text: "Title", index: "title", width: 200 },
                        {
                            title: "Assigned team member",
                            text: "Assigned To",
                            index: "assignedTo",
                            width: 125
                        },
                        { title: "Work Item State", text: "State", index: "state", width: 100 },
                        { title: "All votes per item", text: "Votes", index: "allVotes", width: 60 },
                        { text: "Order", index: "order", width: 50, hidden: true }
                    ],
                    sortOrder: [
                        {
                            index: "allVotes",
                            order: "desc"
                        }
                    ],
                    autoSort: true
                });
        });
    };


    private getVotedObjectsFromVsts(votingDoc: any): any[] {
        LogExtension.log("createReportTable _1");
        LogExtension.log(votingDoc);
        let currentVoting = votingDoc.voting[votingDoc.voting.length - 1];
        LogExtension.log("createReportTable _2");
        LogExtension.log(currentVoting);
        let itemIds = votingDoc.vote.filter((v) => v.votingId == currentVoting.created);
        LogExtension.log("createReportTable _3");
        LogExtension.log(itemIds);
        let workItemIdArray = itemIds.map((x, i) => x.workItemId);
        LogExtension.log("createReportTable _4");
        LogExtension.log(workItemIdArray);
        return workItemIdArray;
    }
}