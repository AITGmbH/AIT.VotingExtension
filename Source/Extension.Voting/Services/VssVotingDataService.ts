/// <reference path="../node_modules/vss-web-extension-sdk/typings/vss.d.ts" />
//import WorkItemTrackingRestClient = require("TFS/WorkItemTracking/RestClient");
//import WorkRestClient = require("TFS/Work/RestClient");
//import TFS_Core_Contracts  = require("TFS/Core/Contracts");

class VssVotingDataService implements IVotingDataService {

    private votingName: string;
    private webContext: WebContext;

    public constructor() {
        this.webContext = VSS.getWebContext();
        this.votingName = this.webContext.collection.name;
    }

    private getVssService(): IPromise<IExtensionDataService> {
        return VSS.getService(VSS.ServiceIds.ExtensionData);
    }

    async getAllVotings(): Promise<any[]> {
        let service = await this.getVssService();
        let allVotesPromise = service.getDocuments(this.votingName);
        console.debug("getAllVotings() returns");
        console.debug(allVotesPromise);
        return allVotesPromise;
    }

    async getTeamVoting(teamid: string): Promise<any> {
        let docs = await this.getAllVotings();
        let teamVoting = docs.filter(doc => doc.id.indexOf(teamid) !== -1);
        if (teamVoting.length === 0) {
            console.warn("getTeamVoting() found more no documents for the current team.");
            console.debug(teamVoting);
            return null;
        }
        if (teamVoting.length !== 1) {
            console.warn("getTeamVoting() found more than one document for the current team.");
            console.debug(teamVoting);
        }
        var retval = teamVoting[0];
        console.debug("getTeamVotings() returns");
        console.debug(retval);
        return retval;
    }

    async storeDocument(doc) {
        let service = await this.getVssService();
        service.updateDocument(this.webContext.collection.name, doc);
    }

    private async getAreas() {
        VSS.require(["VSS/Service", "TFS/Work/RestClient"],
            async (VSS_Service, client) => {
                //var client = WorkRestClient.getClient();

                //VSS.require(["VSS/Service", "TFS/Work/RestClient"], (VSS_Service, TFS_Work_WebApi) => {
                //    LogExtension.log("in require");
                //    var client = TFS_Work_WebApi.getClient();
                LogExtension.log("got REST-Client");
                var tempAreas = "AND ( ";
                var teamcontext =
                    {
                        projectId: this.webContext.project.id,
                        teamId: this.webContext.team.id,
                        project: null,
                        team: null
                    }; // as TFS_Core_Contracts.TeamContext;

                var teamfieldvalues = await client.getTeamFieldValues(teamcontext);
                LogExtension.log(teamfieldvalues);
                teamfieldvalues.values.forEach((value, index) => {
                    tempAreas += "[System.AreaPath] UNDER '";
                    tempAreas += value.value;
                    tempAreas += "'";
                    if (index < (teamfieldvalues.values.length - 1)) {
                        tempAreas += " OR ";
                    } else {
                        tempAreas += " )";
                    }
                });
                LogExtension.log(tempAreas);
            });
    }

    private assignedToUnassignedText: string = "";

    private getNameOfWiResponsiveness(req: any): string {
        const assignedTo = req.fields["System.AssignedTo"];
        var displayName = (assignedTo == undefined) ? this.assignedToUnassignedText : assignedTo.displayName;
        return displayName;
    };


    //Method to load the Requirements from TFS
    //public loadRequirements(level: string, asyncCallback) {
    //    // var witClient = WorkItemTrackingRestClient.getClient();

    //    VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"],
    //        async (VSS_Service, witClient) => {

    //            var requirements = new Array<TinyRequirement>();
    //            //     VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"], (VSS_Service, TFS_Wit_WebApi) => {
    //            //        var witClient = VSS_Service.getCollectionClient(TFS_Wit_WebApi.WorkItemTrackingHttpClient);
    //            //Getting all states, sort out 'Closed', 'Done', 'Removed' later
    //            //[System.State] <> 'Closed' AND [System.State] <> 'Done' AND [System.State] <> 'Removed' AND
    //            var wiql =
    //                "SELECT [System.Id] FROM WorkItems WHERE [System.State] <> 'Closed' AND [System.State] <> 'Done' AND [System.State] <> 'Removed'" +
    //                " AND [System.WorkItemType] = '" +
    //                level +
    //                "' " +
    //                this.getAreas();
    //            var wiqlJson = {
    //                query: wiql
    //            }
    //            LogExtension.log("WIQL-Abfrage: " + wiql);
    //            var idJson = await witClient.queryByWiql(wiqlJson, this.webContext.project.id);

    //            LogExtension.log(idJson);
    //            var workItemIds: number[] = new Array();
    //            LogExtension.log(idJson.workItems);

    //            idJson.workItems.forEach(item => {
    //                workItemIds = new Array<number>();
    //                workItemIds.push(item.id);
    //            });

    //            var workItems = await witClient.getWorkItems(workItemIds);

    //            workItems.forEach((req) => {

    //                var tempRequirement = new TinyRequirement();
    //                tempRequirement.Id = req.id.toString();

    //                if (req.fields['Microsoft.VSTS.Common.StackRank'] != undefined) {
    //                    tempRequirement.Order = req.fields['Microsoft.VSTS.Common.StackRank'];
    //                } else if (req.fields['Microsoft.VSTS.Common.BacklogPriority'] != undefined) {
    //                    tempRequirement.Order = req.fields['Microsoft.VSTS.Common.BacklogPriority'];
    //                } else {
    //                    tempRequirement.Order = "0";
    //                }

    //                tempRequirement.Title = req.fields['System.Title'];
    //                tempRequirement.WorkItemType = req.fields['System.WorkItemType'];
    //                tempRequirement.State = req.fields['System.State'];
    //                tempRequirement.Size = req.fields['Microsoft.VSTS.Scheduling.Size'];
    //                tempRequirement.ValueArea = req.fields['Microsoft.VSTS.Common.BusinessValue'];
    //                tempRequirement.IterationPath = req.fields['System.IterationPath'];
    //                tempRequirement.AssignedTo = this.getNameOfWiResponsiveness(req);
    //                tempRequirement.Description = req.fields['System.Description'];

    //                requirements.push(tempRequirement);
    //            });
    //            asyncCallback(requirements);
    //        });
    //}
}