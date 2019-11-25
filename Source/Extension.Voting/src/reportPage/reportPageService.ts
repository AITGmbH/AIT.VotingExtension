import { BaseDataService } from "../services/baseDataService";
import { ReportItem } from "../entities/reportItem";
import { Report } from "../entities/report";
import { LogExtension } from "../shared/logExtension";
import { TinyRequirement } from "../entities/TinyRequirement";
import { getClient as getWitClient } from "TFS/WorkItemTracking/RestClient";
import { VotingTypes } from "../entities/votingTypes";
import { Voting } from "../entities/voting";
import { bsNotify } from "../shared/common";

export class ReportPageService extends BaseDataService {
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
        switch (votingDocument.voting.type) {
            case VotingTypes.LEVEL:
                await this.loadWorkItemsByTypesAsync(
                    votingDocument.voting.level
                );
                report.workItemTypeName = votingDocument.voting.level;

                break;
            case VotingTypes.QUERY:
                await this.loadWorkItemsByQueryAsync(
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

        let repItems = this.requirements.map(wit => <ReportItem>Object.assign(wit));

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
}
