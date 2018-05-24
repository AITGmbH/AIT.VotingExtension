/// <reference path="../node_modules/vss-web-extension-sdk/typings/vss.d.ts" />

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
        return allVotesPromise;
    }

    async storeDocument(doc) {
        let service = await this.getVssService();
        service.updateDocument(this.webContext.collection.name, doc);
    }
}


