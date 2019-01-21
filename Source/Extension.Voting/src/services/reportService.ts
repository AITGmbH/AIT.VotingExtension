import { VotingDataService } from "./votingDataService";
import { LogExtension } from "../shared/logExtension";
import { ReportItem } from "../entities/reportItem";
import { Report } from "../entities/report";
import { VotingDocument } from "../entities/votingDocument";

export class ReportCreationService {
    private votingdataservice: VotingDataService;

    constructor() {
        this.votingdataservice = new VotingDataService();
    }

    public async createReport(container: any, votingDoc: VotingDocument): Promise<void> {
        var report =  await this.collectReportData(votingDoc);
        LogExtension.log(report);
        this.generateVotesGrid(container, report.workItemArray);
    }

    private generateVotesGrid(container: HTMLElement, dataSource: ReportItem[]) {
        container.innerHTML = '';
        VSS.require(["VSS/Controls", "VSS/Controls/Grids"], (Controls, Grids) => {
            Controls.create(Grids.Grid, container,
            {
                height: "400px",
                allowMultiSelect: false,
                source: dataSource,
                columns: [
                    { title: "Work Item ID", text: "ID", index: "id", width: 50, id: "itemId" },
                    { title: "Work Item Type", text: "Work Item Type", index: "workItemType", width: 100 },
                    { title: "Work Item Title", text: "Title", index: "title", width: 200 },
                    { title: "Assigned team member", text: "Assigned To", index: "assignedTo", width: 125 },
                    { title: "Work Item State", text: "State", index: "state", width: 100 },
                    { title: "All votes per item", text: "Votes", index: "totalVotes", width: 60 },
                    { text: "Order", index: "order", width: 50, hidden: true }
                ],
                sortOrder: [
                    {
                        index: "totalVotes",
                        order: "desc"
                    }
                ],
                autoSort: true
            });
        });
    };

    private async collectReportData(votingDoc: VotingDocument) : Promise<Report>{        
        let report = new Report();
        report.description = votingDoc.voting.description;
        report.title = votingDoc.voting.title;
        report.workItemTypeName = votingDoc.voting.level;
        
        // Create ReportItem from WorkItems
        let relevantvotes = votingDoc.vote.filter((v) => v.votingId == votingDoc.voting.created);
        let workItemIdArray = relevantvotes.map((x, i) => x.workItemId);
        let workItems = await this.votingdataservice.getWorkItems(workItemIdArray, null); //TODO check, dataservice is neccessary to use
        report.workItemArray = workItems.map(wit => new ReportItem(wit));
                     
        // Add Votes
        votingDoc.vote.forEach((vote)=>{report.addVote(vote.workItemId)})
        
        return report;
    }
}