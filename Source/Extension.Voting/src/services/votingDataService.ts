import { VotingDocument } from "../entities/votingDocument";
import { TinyRequirement } from "../entities/tinyRequirement";
import { LogExtension } from "../shared/logExtension";
import WitRestClient = require("TFS/WorkItemTracking/RestClient");

export class VotingDataService {
     private webContext: WebContext;
    public assignedToUnassignedText: string = "";

    public constructor() {
        this.webContext = VSS.getWebContext();
    }

    public async getAllVotingsAsync(): Promise<VotingDocument[]> {
        try {
            let service = await this.getVssServiceAsync();
            return await service.getDocuments(this.webContext.collection.name);
        } catch (err) {
            LogExtension.log("votingDataService.getAllVotings: Could not get documents", err);
            return [];
        }
    }

    public async getDocumentAsync(id: string): Promise<VotingDocument> {
        const service = await this.getVssServiceAsync();

        try {
            var doc = await service.getDocument(this.webContext.collection.name, id) as VotingDocument;
            if (doc == null) {
                return null;
            }

            // map old string properties to new typed properties for backwards compatability
            let voting = doc.voting;
            if (doc.voting instanceof Array) {
                voting = doc.voting[0];
                for (var i = 1; i < doc.voting.length; i++) {
                    if (voting.lastModified < doc.voting[i].lastModified) {
                        voting = doc.voting[i];
                    }
                }
                
            }

            voting.isVotingEnabled = voting.hasOwnProperty('votingEnabled') ? (<any>voting).votingEnabled === "true" : voting.isVotingEnabled;
            voting.isMultipleVotingEnabled = voting.hasOwnProperty('multipleVoting') ? (<any>voting).multipleVoting === "true" : voting.isMultipleVotingEnabled;

            return doc;
        } catch (err) {
            LogExtension.log("votingDataService.getDocument: Could not get document", err);
            return null;
        }
    }

    public async updateDocumentAsync(doc: VotingDocument): Promise<VotingDocument> {
        try {
            const service = await this.getVssServiceAsync();
            return await service.setDocument(this.webContext.collection.name, doc);
        } catch (err) { 
            LogExtension.log("votingDataService.updateDocument: Could not update document", err);
            return null;
        }
    }

    private async getVssServiceAsync(): Promise<IExtensionDataService> {
        return await VSS.getService(VSS.ServiceIds.ExtensionData) as IExtensionDataService;
    }

    private async getAllVotings(): Promise<any[]> {
        try {
            const service = await this.getVssServiceAsync();
            return await service.getDocuments(this.webContext.collection.name);
        } catch (err) { 
            LogExtension.log("votingDataService.getAllVotings: Could not get document", err);
            return null;
        }        
     }

    public async getTeamVoting(teamid: string): Promise<VotingDocument> {
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

    public async getWorkItems(workItemIdArray: number[], asyncCallback: (obj: TinyRequirement[]) => void) : Promise<TinyRequirement[]> {
        var client = WitRestClient.getClient();

        if(workItemIdArray.length ==0)
            return null;
            
        var items = await client.getWorkItems(workItemIdArray,null,null,null,null,null);
      
         let workitems = new Array<TinyRequirement>();
        items.forEach(item => {
            let tinyItem = this.createTinyRequirementFromAnnonymous(item);
            workitems.push(tinyItem);
        });
        console.debug(workitems);
        return workitems;
    }

    private createTinyRequirementFromAnnonymous(object): TinyRequirement {

        var tempRequirement = new TinyRequirement();
        tempRequirement.id = object.id;
        if (object.fields['Microsoft.VSTS.Common.StackRank'] != undefined) {
            tempRequirement.order = object.fields['Microsoft.VSTS.Common.StackRank'];
        }
        else if (object.fields['Microsoft.VSTS.Common.BacklogPriority'] != undefined) {
            tempRequirement.order = object.fields['Microsoft.VSTS.Common.BacklogPriority'];
        } else {
            tempRequirement.order = "0";
        }
        tempRequirement.title = object.fields['System.Title'];
        tempRequirement.workItemType = object.fields['System.WorkItemType'];
        tempRequirement.state = object.fields['System.State'];
        tempRequirement.size = object.fields['Microsoft.VSTS.Scheduling.Size'];
        tempRequirement.valueArea = object.fields['Microsoft.VSTS.Common.BusinessValue'];
        tempRequirement.iterationPath = object.fields['System.IterationPath'];
        tempRequirement.assignedTo = this.getNameOfWiResponsiveness(object);
        tempRequirement.description = object.fields['System.Description'];

        return tempRequirement;
    };

    private getNameOfWiResponsiveness(req: any): string {
        const assignedTo = req.fields["System.AssignedTo"];
        var displayName = (assignedTo == undefined) ? this.assignedToUnassignedText : assignedTo.displayName;
        return displayName;
    };
}


