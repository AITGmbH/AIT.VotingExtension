import { VotingDocument } from "../entities/votingDocument";
import { LogExtension } from "../shared/logExtension";
import { VotingTypes } from "../entities/votingTypes";

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
            LogExtension.log(
                "votingDataService.getAllVotings: Could not get documents",
                err
            );
            return [];
        }
    }

    public async getDocumentAsync(id: string): Promise<VotingDocument> {
        const service = await this.getVssServiceAsync();

        try {
            var doc = (await service.getDocument(
                this.webContext.collection.name,
                id
            )) as VotingDocument;
            if (doc == null) {
                return Promise.resolve(this.emptyDoc());
            }

            // map old string properties to new typed properties for backwards compatability
            let voting = doc.voting;
            if (doc.voting != null && doc.voting instanceof Array) {
                voting = doc.voting[0];
                for (let i = 1; i < doc.voting.length; i++) {
                    if (voting.lastModified < doc.voting[i].lastModified) {
                        voting = doc.voting[i];
                    }
                }
            }

            voting.isVotingEnabled = voting.hasOwnProperty("votingEnabled")
                ? (<any>voting).votingEnabled === "true"
                : voting.isVotingEnabled;
            voting.type = voting.type || VotingTypes.LEVEL;

            return doc;
        } catch (err) {
            LogExtension.log(
                "votingDataService.getDocument: Could not get document",
                err
            );
            return Promise.resolve(this.emptyDoc());
        }
    }

    public async updateDocumentAsync(
        doc: VotingDocument
    ): Promise<VotingDocument> {
        try {
            const service = await this.getVssServiceAsync();
            return await service.setDocument(
                this.webContext.collection.name,
                doc
            );
        } catch (err) {
            LogExtension.log(
                "votingDataService.updateDocument: Could not update document",
                err
            );
            return doc;
        }
    }

    public async deleteDocumentAsync(documentId: string): Promise<void> {
        try {
            const service = await this.getVssServiceAsync();
            return await service.deleteDocument(
                this.webContext.collection.name,
                documentId
            );
        } catch (err) {
            LogExtension.log(
                "votingDataService.deleteDocumentAsync: Could not delete document",
                err
            );
        }
    }

    private async getVssServiceAsync(): Promise<IExtensionDataService> {
        return await VSS.getService<IExtensionDataService>(
            VSS.ServiceIds.ExtensionData
        );
    }

    private emptyDoc(): VotingDocument {
        return <VotingDocument>{};
    }
}
