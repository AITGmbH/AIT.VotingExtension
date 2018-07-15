import { VotingDocument } from "../entities/votingDocument";

export class VotingDataService {
    private votingName: string;
    private webContext: WebContext;

    public constructor() {
        this.webContext = VSS.getWebContext();
        this.votingName = this.webContext.collection.name;
    }

    public async getAllVotings(): Promise<VotingDocument[]> {
        let service = await this.getVssService();
        return service.getDocuments(this.votingName);
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
        } catch {
            return null;
        }
    }

    public async updateDocument(doc: VotingDocument): Promise<VotingDocument> {
        try {
            const service = await this.getVssService();
            return await service.updateDocument(this.webContext.collection.name, doc);
        } catch { }
    }

    public async createDocument(doc: VotingDocument): Promise<VotingDocument> {
        try {
            const service = await this.getVssService();
            return await service.createDocument(this.webContext.collection.name, doc);
        } catch { }
    }

    private async getVssService(): Promise<IExtensionDataService> {
        return await VSS.getService(VSS.ServiceIds.ExtensionData) as IExtensionDataService;
    }
}


