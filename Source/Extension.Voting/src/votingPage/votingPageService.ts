import { BaseDataService } from "../services/baseDataService";
import { Vote } from "../entities/vote";
import { TinyRequirement } from "../entities/tinyRequirement";
import { LogExtension } from "../shared/logExtension";
import { VotingItem } from "../entities/votingItem";
import { bsNotify } from "../shared/common";
import { getClient } from "TFS/Work/RestClient";
import { TeamContext } from "TFS/Core/Contracts";
import { getClient as getWitClient } from "TFS/WorkItemTracking/RestClient";
import * as _ from "lodash";
import { Voting } from "../entities/voting";

export class VotingPageService extends BaseDataService {
    private _areas: string;
    private _requirements: TinyRequirement[];

    public votes: Vote[];
    public nothingToVote: (isThereAnythingToVote: boolean) => void;
    public numberOfMyVotes: () => number;
    public calculating: () => void;
    public getVoteItem: (id: number) => VotingItem;
    public getActualVotingItems: () => VotingItem[];

    constructor() {
        super();
    }

    public get requirements(): TinyRequirement[] {
        return this._requirements;
    }

    public async loadVotesAsync() {
        const doc = await this.votingDataService.getDocumentAsync(
            this.documentId
        );
        this.votes = [];

        if (doc.vote != null && doc.vote.length > 0) {
            this.votes = doc.vote;
        }
    }

    public async getAreasAsync(): Promise<void> {
        const client = getClient();
        let areas = "( ";

        const teamcontext: TeamContext = {
            project: null,
            projectId: this.context.project.id,
            team: null,
            teamId: this.team.id
        };

        const teamfieldvalues = await client.getTeamFieldValues(teamcontext);
        LogExtension.log(teamfieldvalues);

        for (let i = 0; i < teamfieldvalues.values.length; i++) {
            const value = teamfieldvalues.values[i];
            areas += `[System.AreaPath] ${
                value.includeChildren ? "UNDER" : "="
            } '${value.value}'`;

            if (i < teamfieldvalues.values.length - 1) {
                areas += " OR ";
            } else {
                areas += " )";
            }
        }

        LogExtension.log(areas);
        this._areas = areas;
        LogExtension.log("finish area");
    }

    /**
     * Loads WorkItems by list of WorkItemTypes (backlog-level-based).
     *
     * @param type A comma separated string of required WorkItemTypes. Example: "Requirement,Bug"
     * @see VotingTypes
     */
    public async loadWorkItemsByTypes(types: string): Promise<void> {
        const wiql =
            "SELECT [System.Id] FROM WorkItems" +
            " WHERE [System.State] <> 'Closed'" +
            " AND [System.State] <> 'Done'" +
            " AND [System.State] <> 'Removed'" +
            " AND ( [System.WorkItemType] = '" +
            types.replace(",", "' OR [System.WorkItemType] = '") +
            "' )" +
            " AND " +
            this._areas;

        return this.loadWorkItemsAsync(wiql);
    }

    /**
     * Loads WorkItems based on a Query.
     *
     * @param queryId Id of a query.
     * @see VotingTypes
     */
    public async loadWorkItemsByQuery(queryId: string): Promise<void> {
        const query = await this.getQueryById(queryId);
        return this.loadWorkItemsAsync(query.wiql);
    }

    /**
     * Loads WorkItems based on a WIQL string.
     *
     * @param wiql Id of a query or comma separated string of required WorkItemTypes.
     */
    private async loadWorkItemsAsync(wiql: string): Promise<void> {
        this._requirements = new Array<TinyRequirement>();
        const witClient = getWitClient();

        const wiqlJson = {
            query: wiql
        };

        LogExtension.log("WIQL-Abfrage: " + wiql);

        const idJson = await witClient.queryByWiql(
            wiqlJson,
            this.context.project.id
        );
        LogExtension.log(idJson);
        const headArray = new Array();
        let tempArray = new Array();
        LogExtension.log(idJson.workItems);
        for (let i = 0; i < idJson.workItems.length; i++) {
            const item = idJson.workItems[i];

            if ((i + 1) % 200 !== 0) {
                tempArray.push(item.id);
            } else {
                headArray.push(tempArray);
                tempArray = new Array<string>();
                tempArray.push(item.id);
            }
        }

        headArray.push(tempArray);

        for (const array of headArray) {
            try {
                if (array == null || array.length == 0) {
                    continue;
                }

                const result = await witClient.getWorkItems(array);
                for (const req of result) {
                    LogExtension.log(req);

                    const tempRequirement = new TinyRequirement();
                    tempRequirement.id = req.id;
                    if (
                        req.fields["Microsoft.VSTS.Common.StackRank"] !==
                        undefined
                    ) {
                        tempRequirement.order =
                            req.fields["Microsoft.VSTS.Common.StackRank"];
                    } else if (
                        req.fields["Microsoft.VSTS.Common.BacklogPriority"] !==
                        undefined
                    ) {
                        tempRequirement.order =
                            req.fields["Microsoft.VSTS.Common.BacklogPriority"];
                    } else {
                        tempRequirement.order = "0";
                    }
                    tempRequirement.title = req.fields["System.Title"];
                    tempRequirement.workItemType =
                        req.fields["System.WorkItemType"];
                    tempRequirement.state = req.fields["System.State"];
                    tempRequirement.size =
                        req.fields["Microsoft.VSTS.Scheduling.Size"];
                    tempRequirement.valueArea =
                        req.fields["Microsoft.VSTS.Common.BusinessValue"];
                    tempRequirement.iterationPath =
                        req.fields["System.IterationPath"];
                    tempRequirement.assignedTo = this.getNameOfWiResponsiveness(
                        req
                    );
                    tempRequirement.description =
                        req.fields["System.Description"];

                    this.requirements.push(tempRequirement);
                }
            } catch (err) {
                LogExtension.log("Error at getWorkItems()");
                LogExtension.log(err);
                this.nothingToVote(false);
            }
        }
    }

    private validateVote(voting: Voting, id: number, upVote: boolean): boolean {
        const now = Date.now();
        const voteItem = this.getVoteItem(id);
        const isEnabled = voting.isVotingEnabled;
        const isPaused = voting.isVotingPaused;
        const isProspective = voting.useStartTime && now < voting.start;
        const isOverdue = voting.useEndTime && now > voting.end;

        if (voting == null) {
            bsNotify(
                "warning",
                "This voting has been stopped. \nPlease refresh your browser window to get the actual content."
            );
            return;
        } else if (!isEnabled) {
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

    public async updateBacklogAsync(
        wis: VotingItem[],
        firstBacklogItem: VotingItem
    ): Promise<void> {
        LogExtension.log("begin updating");

        const order = this.getTemplate();
        let success = true;

        for (let i = 0; i < wis.length; i++) {
            const item = wis[i];

            const newOrder = parseInt(firstBacklogItem.order) - (i + 1);
            const comment = "Updated by AIT Voting Extension";
            const pathOrder = "/fields/" + order;
            const pathComment = "/fields/System.History";
            const newJson = [
                {
                    op: "replace",
                    path: pathOrder,
                    value: newOrder
                },
                {
                    op: "add",
                    path: pathComment,
                    value: comment
                }
            ];

            const witClient = getWitClient();

            try {
                await witClient.updateWorkItem(newJson, item.id);
                LogExtension.log("replace success: " + item.id);
            } catch (err) {
                LogExtension.log(
                    "replace failed: " + item.id + ", trying to add..."
                );
                const addJson = [
                    {
                        op: "add",
                        path: pathOrder,
                        value: newOrder
                    },
                    {
                        op: "add",
                        path: pathComment,
                        value: comment
                    }
                ];

                witClient.updateWorkItem(addJson, item.id).then(
                    result => {
                        LogExtension.log("add success: " + item.id);
                    },
                    error => {
                        LogExtension.log(error);
                    }
                );

                success = false;
            }
        }

        if (success) {
            bsNotify("success", "Your backlog has been successfully updated.");
        } else {
            bsNotify(
                "danger",
                "An error occured.\nPlease refresh the page and try again"
            );
        }
    }

    public async applyToBacklogAsync(): Promise<void> {
        try {
            const voting = new Voting();
            <Voting>Object.assign(voting, await this.loadVotingAsync());
            await this.loadVotesAsync();
            await this.getAreasAsync();

            if (!voting.isBacklogBased) {
                bsNotify(
                    "danger",
                    "This voting is not applyable.\nPlease refresh the page and try again."
                );
                return;
            }

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
            bsNotify(
                "danger",
                "An error occured.\nPlease refresh the page and try again"
            );
            LogExtension.log(err);
        }
    }

    public async removeAllUserVotesAsync(userId: string): Promise<void> {
        const docs = await this.votingDataService.getAllVotingsAsync();

        try {
            const promises = [];
            for (const doc of docs) {
                doc.vote = doc.vote.filter(vote => vote.userId !== userId);
                promises.push(this.votingDataService.updateDocumentAsync(doc));
            }

            await Promise.all(promises);

            bsNotify("success", "Your votes have been successfully removed.");
        } catch (e) {
            LogExtension.log(e);
        }
    }

    private getNameOfWiResponsiveness(req: any): string {
        const assignedTo = req.fields["System.AssignedTo"];
        const displayName =
            assignedTo === undefined ? "" : assignedTo.displayName;
        return displayName;
    }
}
