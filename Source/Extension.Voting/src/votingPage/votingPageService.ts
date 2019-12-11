import * as _ from "lodash";
import { BaseDataService } from "../services/baseDataService";
import { bsNotify, compareUserString } from "../shared/common";
import { LogExtension } from "../shared/logExtension";
import { Vote } from "../entities/vote";
import { Voting } from "../entities/voting";
import { VotingItem } from "../entities/votingItem";

export class VotingPageService extends BaseDataService {
    public numberOfMyVotes: () => number;
    public getVoteItem: (id: number) => VotingItem;

    constructor() {
        super();
    }

    private validateVote(voting: Voting, id: number, upVote: boolean): boolean {
        const now = Date.now();
        const voteItem = this.getVoteItem(id);
        const isEnabled = voting.isVotingEnabled;
        const isPaused = voting.isVotingPaused;
        const isProspective = voting.useStartTime && now < voting.start;
        const isOverdue = voting.useEndTime && now > voting.end;
        const cannotVoteForAssignedWorkItems = voting.cannotVoteForAssignedWorkItems && compareUserString(voteItem.assignedToFull, this.context.user);
        const cannotVoteForOwnWorkItems = voting.cannotVoteForOwnWorkItems && compareUserString(voteItem.createdByFull, this.context.user);

        if (voting == null) {
            bsNotify(
                "warning",
                "This voting has been stopped. \nPlease refresh your browser window to get the actual content."
            );
            return;
        }
        else if (!isEnabled) {
            bsNotify(
                "danger",
                "This voting session has been stopped. \nPlease refresh your browser window to get the actual content."
            );
            return false;
        } else if (isPaused) {
            bsNotify(
                "danger",
                "This voting session has been paused. \nPlease refresh your browser window to get the actual content."
            );
            return false;
        } else if (isProspective) {
            bsNotify(
                "danger",
                "This voting session has not yet started. \nPlease refresh your browser window to get the actual content."
            );
            return false;
        } else if (isOverdue) {
            bsNotify(
                "danger",
                "This voting session has expired. \nPlease refresh your browser window to get the actual content."
            );
            return false;
        } else if (
            upVote &&
            voting.numberOfVotes - this.numberOfMyVotes() < 1
        ) {
            bsNotify(
                "danger",
                "You have no vote remaining. \nPlease refresh your browser window to get the actual content."
            );
            return false;
        } else if (!upVote && voteItem.myVotes <= 0) {
            bsNotify(
                "danger",
                "There are no more votes of yours on this item. \nPlease refresh your browser window to get the actual content."
            );
            return false;
        } else if (upVote && voteItem.myVotes >= voting.voteLimit) {
            bsNotify(
                "danger",
                `This work item is on the vote limit of ${
                voting.voteLimit
                }. \nPlease refresh your browser window to get the actual content.`
            );
            return false;
        } else if (cannotVoteForAssignedWorkItems) {
            bsNotify(
                "danger",
                `You cannot vote for your assigned work items.`
            );
            return false;            
        } else if (cannotVoteForOwnWorkItems) {
            bsNotify(
                "danger",
                `You cannot vote for your own work items.`
            );
            return false;            
        } else {
            return true;
        }
    }

    public async saveVoteAsync(vote: Vote) {
        const doc = await this.votingDataService.getDocumentAsync(
            this.documentId
        );

        if (this.validateVote(doc.voting, vote.workItemId, true)) {
            doc.vote.push(vote);
            const uDoc = await this.votingDataService.updateDocumentAsync(doc);
            LogExtension.log("saveVote: document updated", uDoc.id);

            bsNotify("success", "Your vote has been saved.");
        }
    }

    public async deleteVoteAsync(id: number, userId: string) {
        const doc = await this.votingDataService.getDocumentAsync(
            this.documentId
        );

        if (this.validateVote(doc.voting, id, false)) {
            LogExtension.log("Item Id", id);

            for (let i = 0; i < doc.vote.length; i++) {
                const item = doc.vote[i];

                if (item.workItemId === id) {
                    LogExtension.log(item.workItemId, id);
                    if (item.userId === userId) {
                        doc.vote.splice(i, 1);
                        break;
                    }
                }
            }

            const uDoc = await this.votingDataService.updateDocumentAsync(doc);
            LogExtension.log("deleteVote: document updated", uDoc.id);

            bsNotify("success", "Your vote has been deleted.");
        }
    }

    public async removeUserVotesByTeamAsync(userId: string): Promise<void> {
        const docs = await this.votingDataService.getAllVotingsAsync();

        try {
            for (const doc of docs) {
                if (doc.voting.team === this.team.id) {
                    doc.vote = doc.vote.filter(vote => vote.userId !== userId);
                    await this.votingDataService.updateDocumentAsync(doc);
                }
            }
            bsNotify("success", "Your votes have been successfully removed.");
        } catch (e) {
            LogExtension.log(e);
        }
    }
}
