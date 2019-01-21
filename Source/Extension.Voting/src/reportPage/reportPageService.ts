import { BaseDataService } from "../services/baseDataService";
import { ReportItem } from "../entities/reportItem";
import { Report } from "../entities/report";

export class ReportPageService extends BaseDataService{

    constructor() {
        super();
    }

    public async collectReportData() : Promise<Report>{
        let votingDoc = await this.votingDataService.getDocumentAsync(this.documentId);
        let report = new Report();
        report.description = votingDoc.voting.description;
        report.title = votingDoc.voting.title;
        report.workItemTypeName = votingDoc.voting.level;
        
        // Create ReportItem from WorkItems
        let relevantvotes = votingDoc.vote.filter((v) => v.votingId == votingDoc.voting.created);
        let workItemIdArray = relevantvotes.map((x, i) => x.workItemId);
        let workItems = await this.votingDataService.getWorkItems(workItemIdArray); //TODO check, dataservice is neccessary to use
        report.workItemArray = workItems.map(wit => new ReportItem(wit));
                     
        // Add Votes
        votingDoc.vote.forEach((vote)=>{report.addVote(vote.workItemId)})
        
        return report;
    }
}