import { BaseDataService } from "../services/baseDataService";
import { ReportItem } from "../entities/reportItem";
import { Report } from "../entities/report";

export class ReportPageService extends BaseDataService{

    constructor() {
        super();
    }

    public async loadReportData() : Promise<Report>{
        let votingDoc = await this.votingDataService.getDocumentAsync(this.documentId);
        let report = new Report();
        report.description = votingDoc.voting.description;
        report.title = votingDoc.voting.title;
        report.workItemTypeName = votingDoc.voting.level;
        
        // Create ReportItem from WorkItems
        let relevantvotes = votingDoc.vote.filter(v => v.votingId == votingDoc.voting.created);
        let workItemIdArray = relevantvotes.map(x => x.workItemId);
        let workItems = await this.getWorkItemsAsync(workItemIdArray); //TODO check, dataservice is neccessary to use
        report.workItems = workItems.map(wit => <ReportItem>Object.assign(wit));
                     
        // Count Votes
        votingDoc.vote.forEach( vote => { this.countVotes(report.workItems, vote.workItemId) });
        
        return report;
    }

    private countVotes(workItems: ReportItem[], itemId: number) {
        const item = workItems.find(x => x.id == itemId);
        if (item) {
            item.totalVotes++;
        }
    }
}