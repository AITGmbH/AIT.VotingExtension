import { BaseDataService } from "../services/baseDataService";
import { ReportItem } from "../entities/reportItem";
import { Report } from "../entities/report";

export class ReportPageService extends BaseDataService{

    constructor() {
        super();
    }

    public async loadReportData(sort: boolean = false, filter?: (req: ReportItem) => boolean) : Promise<Report>{
        const votingDoc = await this.votingDataService.getDocumentAsync(this.documentId);
        const workItems = await this.loadRequirementsAsync(votingDoc.voting.level, await this.loadAreasAsync());
        const report = new Report();
        let repItems = workItems.map(wit => <ReportItem>Object.assign(wit));

        report.description = votingDoc.voting.description;
        report.title = votingDoc.voting.title;
        report.workItemTypeName = votingDoc.voting.level;
        
        if (filter) {
            repItems = repItems.filter(filter);
        }
        
        // Count Votes
        votingDoc.vote.forEach( vote => { this.countVotes(repItems, vote.workItemId) });

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
}