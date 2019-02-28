import { BaseDataService } from "../services/baseDataService";
import { ReportItem } from "../entities/reportItem";
import { Report } from "../entities/report";
import { LogExtension } from "../shared/logExtension";
import { TinyRequirement } from "../entities/TinyRequirement";
import { getClient } from "TFS/Work/RestClient";
import { getClient as getWitClient } from "TFS/WorkItemTracking/RestClient";
import { TeamContext } from "TFS/Core/Contracts";
import { WorkItemExpand } from "TFS/WorkItemTracking/Contracts";

export class ReportPageService extends BaseDataService {
    private _areas: string;

    constructor() {
        super();
    }


    public async loadReportData(sort: boolean = false, filter?: (req: ReportItem) => boolean): Promise<Report> {
        const votingDoc = await this.votingDataService.getDocumentAsync(this.documentId);
        await this.getAreasAsync();
        if (!votingDoc.voting) {
            return;
        }
        const workItems = await this.loadRequirementsAsync(votingDoc.voting.level, this._areas);
        const report = new Report();
        let repItems = workItems.map(wit => <ReportItem>Object.assign(wit));

        report.description = votingDoc.voting.description;
        report.title = votingDoc.voting.title;
        report.workItemTypeName = votingDoc.voting.level;

        if (filter) {
            repItems = repItems.filter(filter);
        }

        // Count Votes
        votingDoc.vote.forEach(vote => { this.countVotes(repItems, vote.workItemId) });

        if (sort) {
            repItems = repItems
                .sort((a, b) => parseInt(a.order) - parseInt(b.order))
                .sort((a, b) => a.totalVotes - b.totalVotes);
        }

        report.workItems = repItems;
        return report;
    }

    private countVotes(workItems: ReportItem[], itemId: number) {
        const item = workItems.find(x => x.id == itemId);
        if (!item) {
            //ignore!
        }
        else if (!item.totalVotes) {
            item.totalVotes = 1;
        }
        else {
            item.totalVotes++;
        }
    }

    public async loadRequirementsAsync(level: string, areas: string): Promise<TinyRequirement[]> {
        let requirements = new Array<TinyRequirement>();

        const wiql = "SELECT [System.Id] FROM WorkItems WHERE [System.State] <> 'Closed' AND [System.State] <> 'Done' AND [System.State] <> 'Removed'"
            + " AND [System.WorkItemType] = '" + level + "' AND " + areas;
        const wiqlJson = {
            query: wiql,
        };

        LogExtension.log("WIQL-Abfrage: " + wiql);

        const idJson = await getWitClient().queryByWiql(wiqlJson, this.context.project.id);
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

                const result = await getWitClient().getWorkItems(array, null, null, WorkItemExpand.Links);
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
            tempRequirement.order = req.fields["Microsoft.VSTS.Common.StackRank"];
        } else if (req.fields["Microsoft.VSTS.Common.BacklogPriority"] !== undefined) {
            tempRequirement.order = req.fields["Microsoft.VSTS.Common.BacklogPriority"];
        } else {
            tempRequirement.order = "0";
        }
        tempRequirement.title = req.fields["System.Title"];
        tempRequirement.workItemType = req.fields["System.WorkItemType"];
        tempRequirement.state = req.fields["System.State"];
        tempRequirement.size = req.fields["Microsoft.VSTS.Scheduling.Size"];
        tempRequirement.valueArea = req.fields["Microsoft.VSTS.Common.BusinessValue"];
        tempRequirement.iterationPath = req.fields["System.IterationPath"];
        tempRequirement.assignedTo = this.getNameOfWiResponsiveness(req);
        tempRequirement.description = req.fields["System.Description"];
        tempRequirement.link = this.getWebLinkToWi(req);

        return tempRequirement;
    }

    private getNameOfWiResponsiveness(req: any): string {
        const assignedTo = req.fields["System.AssignedTo"];
        const displayName =
            assignedTo === undefined ? "" : assignedTo.displayName;
        return displayName;
    }

    private getWebLinkToWi(req: any): string {
        if (req._links) {
            return req._links.html.href ? req._links.html.href : req.url;
        }
        return "";
    }

}