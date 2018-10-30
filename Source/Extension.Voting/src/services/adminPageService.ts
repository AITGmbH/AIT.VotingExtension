import { BaseDataService } from "./baseDataService";
import { LogExtension } from "../shared/logExtension";
import { Voting } from "../entities/voting";
import { bsNotify } from "../shared/common";
import { VotingDocument } from "../entities/votingDocument";

export class AdminPageService extends BaseDataService {
    constructor() {
        super();
    }

    public async addToExcludeAsync(item: string) {
        if (this.excludes.indexOf(item) === -1) {
            this.excludes.push(item);
            this.witFieldNames.splice(this.witFieldNames.indexOf(item), 1);
        }

        const doc = await this.votingDataService.getDocumentAsync(this.documentId);
        doc.excludes = this.excludes;

        const uDoc = await this.votingDataService.updateDocumentAsync(doc);
        LogExtension.log("saveVoting: document updated", uDoc.id);
    }

    public async addToIncludeAsync(item: string) {
        if (this.witFieldNames.indexOf(item) === -1) {
            this.witFieldNames.push(item);
            this.excludes.splice(this.excludes.indexOf(item), 1);
        }

        const doc = await this.votingDataService.getDocumentAsync(this.documentId);
        doc.excludes = this.excludes;

        const uDoc = await this.votingDataService.updateDocumentAsync(doc);
        LogExtension.log("saveVoting: document updated", uDoc.id);
    }

    public async createNewVotingAsync(): Promise<Voting> {
        var newDoc = {
            id: this.documentId,
            voting: new Voting(),
            vote: [],
            excludes: [],
            _etag: -1
        } as VotingDocument;

        const cDoc = await this.votingDataService.updateDocumentAsync(newDoc);
        LogExtension.log("Doc id: " + cDoc.id);
        this.actualSetting = new Voting();
        return this.actualSetting;
    }

    public async resetVotingAsync() {
        const doc = await this.votingDataService.getDocumentAsync(this.documentId);

        doc.voting = new Voting();
        doc.vote = [];
        doc.excludes = this.excludes;

        try {
            await this.votingDataService.updateDocumentAsync(doc);
        } catch (err) {
            LogExtension.log("resetVoting error", err);
        }
    }

    public async saveVotingAsync(voting: Voting) {
        const doc = await this.votingDataService.getDocumentAsync(this.documentId);

        doc.voting = voting;
        doc.excludes = this.excludes;

        try {
            const uDoc = await this.votingDataService.updateDocumentAsync(doc);
            LogExtension.log("saveVoting: document updated", uDoc.id);

            if (voting.isVotingEnabled) {
                bsNotify("success", "Your settings has been saved");
            } else {
                bsNotify("success", "Your voting has been stopped");
            }
        } catch (error) {
            LogExtension.log("Error occured: ", error);
            var newDoc = {
                id: this.documentId,
                voting: new Voting(),
                vote: [],
                excludes: [],
                _etag: -1
            } as VotingDocument;

            const cDoc = await this.votingDataService.updateDocumentAsync(newDoc);
            try {
                LogExtension.log("Doc id: " + cDoc.id);
                cDoc.voting = voting;

                try {
                    const uDoc = await this.votingDataService.updateDocumentAsync(doc);
                    LogExtension.log("saveVoting: document updated", uDoc.id);

                    if (voting.isVotingEnabled) {
                        bsNotify("success", "Your settings has been saved");
                    } else {
                        bsNotify("success", "Your voting has been stopped");
                    }
                } catch (err) {
                    LogExtension.log(err);
                    bsNotify("danger", "Something went wrong. Try to reload page and do it again");
                }
            } catch (error) {
                LogExtension.log("Save settings, loading document", error);
                bsNotify("danger", "Internal connection problems occured, so your settings couldn't be saved.\nPlease refresh the page and try it again");
            }
        }
    }
}