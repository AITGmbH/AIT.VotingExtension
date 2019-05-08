import { BaseDataService } from "../services/baseDataService";
import { ReportItem } from "../entities/reportItem";
import { Report } from "../entities/report";
import { LogExtension } from "../shared/logExtension";
import { TinyRequirement } from "../entities/TinyRequirement";
import { getClient } from "TFS/Work/RestClient";
import { getClient as getWitClient } from "TFS/WorkItemTracking/RestClient";
import { TeamContext } from "TFS/Core/Contracts";
import { WorkItemExpand } from "TFS/WorkItemTracking/Contracts";
import { VotingTypes } from "../entities/votingTypes";
import { Voting } from "../entities/voting";
import { bsNotify } from "../shared/common";
import { Vote } from "../entities/vote";

export class ReportPageService extends BaseDataService {
    private _areas: string;
    private votes: Vote[];

    constructor() {
        super();
    }

    public async loadReportDataAsync(
        sort: boolean = false,
        filter?: (req: ReportItem) => boolean
    ): Promise<Report> {
        const report = new Report();

        const votingDocument = await this.votingDataService.getDocumentAsync(
            this.documentId
        );
        await this.getAreasAsync();
        if (!votingDocument.voting) {
            return report;
        }
        report.voting = votingDocument.voting;
        let workItems = [] as TinyRequirement[];
        switch (votingDocument.voting.type) {
            case VotingTypes.LEVEL:
                workItems = await this.loadWorkItemsByTypesAsync(
                    votingDocument.voting.level
                );
                report.workItemTypeName = votingDocument.voting.level;

                break;
            case VotingTypes.QUERY:
                workItems = await this.loadWorkItemsByQueryAsync(
                    votingDocument.voting.query
                );
                await this.loadFlatQueryNamesAsync();
                for (const query of this.flatQueryNames) {
                    if (query.id === votingDocument.voting.query) {
                        report.workItemTypeName = query.name;
                        break;
                    }
                }
                break;
            default:
                LogExtension.log("error:", "Unknown VotingType!");
                return report;
        }

        let repItems = workItems.map(wit => <ReportItem>Object.assign(wit));

        report.description = votingDocument.voting.description;
        report.title = votingDocument.voting.title;

        if (filter) {
            repItems = repItems.filter(filter);
        }

        // Count Votes
        votingDocument.vote.forEach(vote => {
            this.countVotes(repItems, vote.workItemId);
        });

        if (sort) {
            repItems = repItems
                .sort((a, b) => parseInt(a.order) - parseInt(b.order))
                .sort((a, b) => a.totalVotes - b.totalVotes);
        }

        report.workItems = repItems;
        return report;
    }

    public async isVotingActiveAsync(): Promise<boolean> {
        try {
            const votingDoc = await this.votingDataService.getDocumentAsync(
                this.documentId
            );
            return votingDoc == null || votingDoc.voting.isVotingEnabled;
        } catch (error) {
            return false;
        }
    }

    private countVotes(workItems: ReportItem[], itemId: number) {
        const item = workItems.find(x => x.id == itemId);
        if (!item) {
            //ignore!
        } else if (!item.totalVotes) {
            item.totalVotes = 1;
        } else {
            item.totalVotes++;
        }
    }

    /**
     * Loads WorkItems by list of WorkItemTypes (backlog-level-based).
     *
     * @param type A comma separated string of required WorkItemTypes. Example: "Requirement,Bug"
     * @see VotingTypes
     */
    public async loadWorkItemsByTypesAsync(
        types: string
    ): Promise<TinyRequirement[]> {
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
    public async loadWorkItemsByQueryAsync(
        queryId: string
    ): Promise<TinyRequirement[]> {
        const query = await this.getQueryById(queryId);
        return this.loadWorkItemsAsync(query.wiql);
    }

    private async loadWorkItemsAsync(wiql: string): Promise<TinyRequirement[]> {
        let requirements = new Array<TinyRequirement>();
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

                const result = await getWitClient().getWorkItems(
                    array,
                    null,
                    null,
                    WorkItemExpand.Links
                );
                for (const req of result) {
                    LogExtension.log(req);
                    const tempRequirement = this.createTinyRequirement(req);
                    requirements.push(tempRequirement);
                }
            } catch (err) {
                LogExtension.log("Error at getWorkItems()");
                LogExtension.log(err);
            }
        }
        return requirements;
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
                } '${ value.value }'`;

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

    private createTinyRequirement(req: any): TinyRequirement {
        const tempRequirement = new TinyRequirement();
        tempRequirement.id = req.id;
        if (req.fields["Microsoft.VSTS.Common.StackRank"] !== undefined) {
            tempRequirement.order =
                req.fields["Microsoft.VSTS.Common.StackRank"];
        } else if (
            req.fields["Microsoft.VSTS.Common.BacklogPriority"] !== undefined
        ) {
            tempRequirement.order =
                req.fields["Microsoft.VSTS.Common.BacklogPriority"];
        } else {
            tempRequirement.order = "0";
        }
        tempRequirement.title = req.fields["System.Title"];
        tempRequirement.workItemType = req.fields["System.WorkItemType"];
        tempRequirement.state = req.fields["System.State"];
        tempRequirement.size = req.fields["Microsoft.VSTS.Scheduling.Size"];
        tempRequirement.valueArea =
            req.fields["Microsoft.VSTS.Common.BusinessValue"];
        tempRequirement.iterationPath = req.fields["System.IterationPath"];
        tempRequirement.assignedTo = this.getNameOfWiResponsiveness(req);
        tempRequirement.description = req.fields["System.Description"];
        tempRequirement.link = this.getWebLinkToWi(req);

        return tempRequirement;
    }

    private getWebLinkToWi(req: any): string {
        if (req._links) {
            return req._links.html.href ? req._links.html.href : req.url;
        }
        return "";
    }

    public async applyToBacklogAsync(report: Report): Promise<void> {
        try {
            await this.loadVotesAsync();
            await this.getAreasAsync();

            if (!(report.voting.type == VotingTypes.LEVEL)) {
                bsNotify(
                    "danger",
                    "This voting is not applyable.\nPlease change the voting type to backlog-based voting!"
                );
                return;
            }

            if (!await this.votingHasVotes()) {
                bsNotify(
                    "warning",
                    "This voting is not applyable.\nPlease vote any item to apply the voting to your backlog."
                );
                return;
            }

            const workItems = report.workItems.filter(el => el.totalVotes == null || el.totalVotes == 0);

            workItems.sort((a, b) => {
                return parseInt(a.order) - parseInt(b.order);
            });
            const tempItem = workItems[0];
            const votingItems = report.workItems.filter(el => el.totalVotes > 0);
            LogExtension.log("VotingItems: ", votingItems);

            votingItems.sort((a, b) => {
                return parseInt(b.order) - parseInt(a.order);
            });
            votingItems.sort((a, b) => {
                return a.totalVotes - b.totalVotes;
            });

            await this.updateBacklogAsync(votingItems, tempItem);
        } catch (err) {
            bsNotify(
                "danger",
                "An error occured.\nPlease refresh the page and try again"
            );
            LogExtension.log(err);
        }
    }

    private async updateBacklogAsync(
        wis: ReportItem[],
        firstBacklogItem: ReportItem
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

    public async loadVotingAsync(): Promise<Voting> {
        const doc = await this.votingDataService.getDocumentAsync(
            this.documentId
        );
        LogExtension.log(doc);

        if (doc.voting == null) {
            return new Voting();
        } else {
            return doc.voting;
        }
    }

    private async loadVotesAsync() {
        const doc = await this.votingDataService.getDocumentAsync(
            this.documentId
        );
        this.votes = [];

        if (doc.vote != null && doc.vote.length > 0) {
            this.votes = doc.vote;
        }
    }

}
