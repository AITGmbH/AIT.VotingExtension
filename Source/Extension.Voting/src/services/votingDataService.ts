import { VotingDocument } from "../entities/votingDocument";
import { LogExtension } from "../shared/logExtension";

export class VotingDataService {
    private webContext: WebContext;

    public constructor() {
        this.webContext = VSS.getWebContext();
    }

    public async getAllVotings(): Promise<VotingDocument[]> {
        try {
            let service = await this.getVssService();
            return service.getDocuments(this.webContext.collection.name);
        } catch (err) {
            LogExtension.log("votingDataService.getAllVotings: Could not get documents", err);
            return [];
        }
    }

    public async getDocument(id: string): Promise<VotingDocument> {
        const service = await this.getVssService();

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
            voting.isShowResultsEnabled = voting.hasOwnProperty('showResult') ? (<any>voting).showResult === "true" : voting.isShowResultsEnabled;
            voting.isMultipleVotingEnabled = voting.hasOwnProperty('multipleVoting') ? (<any>voting).multipleVoting === "true" : voting.isMultipleVotingEnabled;

            return doc;
        } catch (err) {
            LogExtension.log("votingDataService.getDocument: Could not get document", err);
            return null;
        }
    }

    public async updateDocument(doc: VotingDocument): Promise<VotingDocument> {
        try {
            const service = await this.getVssService();
            return await service.setDocument(this.webContext.collection.name, doc);
        } catch (err) { 
            LogExtension.log("votingDataService.updateDocument: Could not update document", err);
            return null;
        }
    }

    private async getVssService(): Promise<IExtensionDataService> {
        return await VSS.getService(VSS.ServiceIds.ExtensionData) as IExtensionDataService;
    }
}


