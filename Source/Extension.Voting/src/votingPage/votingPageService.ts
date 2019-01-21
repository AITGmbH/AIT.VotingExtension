import { BaseDataService } from "../services/baseDataService";
import { Vote } from "../entities/vote";
import { TinyRequirement } from "../entities/tinyRequirement";
import { LogExtension } from "../shared/logExtension";
import { VotingItem } from "../entities/votingItem";
import { bsNotify } from "../shared/common";
import * as wit from "TFS/WorkItemTracking/RestClient";
import * as _ from "lodash";

export class VotingPageService extends BaseDataService {
    public votes: Vote[];
    public nothingToVote: (isThereAnythingToVote: boolean) => void;
    public numberOfMyVotes: () => number;
    public calculating: () => void;
    public getActualVotingItems: () => VotingItem[];
    private requirements: TinyRequirement[];

    constructor() {
        super();
    }

    public getRequirements(): TinyRequirement[] {
        return this.requirements;
    }

    public async loadVotesAsync() {
        const doc = await this.votingDataService.getDocumentAsync(this.documentId);
        this.votes = [];

        if (doc.vote != null && doc.vote.length > 0) {
            this.votes = doc.vote;
        }
    }

    public async loadRequirementsAsync(level: string) : Promise<TinyRequirement[]>{
        let areas = await this.loadAreasAsync();
        this.requirements = await super.loadRequirementsAsync(level, areas);
        return this.requirements;
    }

    public async saveVoteAsync(vote: Vote, numberOfVotes: number) {
        const doc = await this.votingDataService.getDocumentAsync(this.documentId);

        const voting = doc.voting;
        const isEnabled = voting.isVotingEnabled;
        const isPaused = voting.isVotingPaused;

        if (isEnabled && !isPaused) {
            let multipleVotes = doc.vote.some(v => v.userId === vote.userId
                && v.votingId === vote.votingId
                && v.workItemId === vote.workItemId);

            if ((numberOfVotes - this.numberOfMyVotes()) < 1) {
                bsNotify("warning", "You have no vote remaining. \nPlease refresh your browser window to get the actual content.");
                return;
            } else {
                if (!voting.isMultipleVotingEnabled && multipleVotes) {
                    bsNotify("warning", "You cannot vote again for this item. Please refresh your browser window to get the actual content.");
                    return;
                } else {
                    doc.vote.push(vote);
                    const uDoc = await this.votingDataService.updateDocumentAsync(doc);
                    LogExtension.log("saveVote: document updated", uDoc.id);

                    bsNotify("success", "Your vote has been saved.");
                }
            }
        } else if (!isEnabled) {
            bsNotify("warning", "This voting has been stopped. \nPlease refresh your browser window to get the actual content.");
        } else if (isPaused) {
            bsNotify("warning", "This voting has been paused. \nPlease refresh your browser window to get the actual content.");
        }
    }

    public async deleteVoteAsync(id: number, userId: string) {
        const doc = await this.votingDataService.getDocumentAsync(this.documentId);
        if (doc.voting == null) {
            bsNotify("warning", "This voting has been stopped. \nPlease refresh your browser window to get the actual content.");
            return;
        }

        let isEnabled = doc.voting.isVotingEnabled;
        if (isEnabled) {
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

    public async updateBacklogAsync(wis: VotingItem[], firstBacklogItem: VotingItem) {
        LogExtension.log("begin updating");

        const order = this.getTemplate();
        let success = true;

        for (let i = 0; i < wis.length; i++) {
            const item = wis[i];

            const newOrder = (parseInt(firstBacklogItem.order) - (i + 1));
            const comment = "Updated by AIT Voting Extension";
            const pathOrder = "/fields/" + order;
            const pathComment = "/fields/System.History";
            const newJson = [
                {
                    op: "replace",
                    path: pathOrder,
                    value: newOrder,
                },
                {
                    op: "add",
                    path: pathComment,
                    value: comment,
                },
            ];

            const witClient = wit.getClient();

            try {
                await witClient.updateWorkItem(newJson, item.id);
                LogExtension.log("replace success: " + item.id);
            } catch (err) {
                LogExtension.log("replace failed: " + item.id + ", trying to add...");
                const addJson = [
                    {
                        op: "add",
                        path: pathOrder,
                        value: newOrder,
                    },
                    {
                        op: "add",
                        path: pathComment,
                        value: comment,
                    },
                ];

                witClient.updateWorkItem(addJson, item.id).then((result) => {
                    LogExtension.log("add success: " + item.id);
                }, (error) => {
                    LogExtension.log(error);
                });

                success = false;
            }
        }

        if (success) {
            bsNotify("success", "Your backlog has been successfully updated.");
        } else {
            bsNotify("danger", "An error occured.\nPlease refresh the page and try again");
        }
    }

    public async applyToBacklogAsync(level: string) {
        try {
            await this.loadVotingAsync();
            await this.loadVotesAsync();
            await this.loadRequirementsAsync(level);

            this.calculating();

            const votingItems = this.getActualVotingItems();
            LogExtension.log("VotingItems: ", votingItems);

            votingItems.sort((a, b) => {
                return parseInt(a.order) - parseInt(b.order);
            });
            const tempItem = votingItems[0];
            votingItems.sort((a, b) => {
                return a.allVotes - b.allVotes;
            });

            for (let idx = 0; idx < votingItems.length; idx++) {
                const item = votingItems[idx];

                if (item.allVotes > 0) {
                    votingItems.splice(0, idx);
                    continue;
                }
            }

            await this.updateBacklogAsync(votingItems, tempItem);
        } catch (err) {
            bsNotify("danger", "An error occured.\nPlease refresh the page and try again");
            LogExtension.log(err);
        }
    }

    public async removeAllUserVotesAsync(userId: string) {
        const docs = await this.votingDataService.getAllVotingsAsync();

        try {
            const promises = [];
            for (const doc of docs) {
                doc.vote = doc.vote.filter((vote) => vote.userId !== userId);
                promises.push(this.votingDataService.updateDocumentAsync(doc));
            }

            await Promise.all(promises);

            bsNotify("success", "Your votes have been successfully removed.");
        } catch (e) {
            LogExtension.log(e);
        }
    }
}