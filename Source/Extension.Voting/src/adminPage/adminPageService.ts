import { BaseDataService } from "../services/baseDataService";
import { LogExtension } from "../shared/logExtension";
import { Voting } from "../entities/voting";
import { bsNotify } from "../shared/common";
import { VotingDocument } from "../entities/votingDocument";
import { convertValueToDisplayString } from "VSS/Utils/Core";

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

        await this.votingDataService.updateDocumentAsync(doc);
        LogExtension.log("saveVoting: document updated");
    }

    public async addToIncludeAsync(item: string) {
        if (this.witFieldNames.indexOf(item) === -1) {
            this.witFieldNames.push(item);
            this.excludes.splice(this.excludes.indexOf(item), 1);
        }

        const doc = await this.votingDataService.getDocumentAsync(this.documentId);
        doc.excludes = this.excludes;

        await this.votingDataService.updateDocumentAsync(doc);
        LogExtension.log("saveVoting: document updated");
    }

    public async saveVotingAsync(voting: Voting) {
        let doc = await this.votingDataService.getDocumentAsync(this.documentId);

        doc.id = this.documentId;
        doc.vote = doc.vote || [];
        doc.excludes = this.excludes;

        // this is necessary because Vue overwrites the property prototypes and JSON.stringify causes an error because of circular dependencies
        doc.voting = <Voting>Object.assign({}, voting);
        doc.voting.hiddenColumns = Object.assign({}, voting.hiddenColumns);

        if (doc.voting.isMultipleVotingEnabled !== voting.isMultipleVotingEnabled
            || doc.voting.level !== voting.level
            || doc.voting.numberOfVotes !== voting.numberOfVotes) {
            doc.vote = [];
        }

        try {
            await this.votingDataService.updateDocumentAsync(doc);
            LogExtension.log("saveVoting: document updated");

            if (voting.isVotingEnabled) {
                bsNotify("success", "Your settings has been saved");
            } else if (voting.isVotingPaused) {
                bsNotify("success", "Your voting has been paused");
            } else if (voting.isVotingEnabled) {
                bsNotify("success", "Your voting has been stopped");
            }
        } catch (error) {
            LogExtension.log("Save settings, loading document", error);
            bsNotify("danger", "Internal connection problems occured, so your settings couldn't be saved.\nPlease refresh the page and try it again");
        }
    }
}