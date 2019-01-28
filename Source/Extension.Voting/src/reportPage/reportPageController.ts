import Vue from "vue";
import Component from "vue-class-component";
import * as controls from "VSS/Controls";
import * as grids from "VSS/Controls/Grids";
import * as statusIndicators from "VSS/Controls/StatusIndicator";
import { LogExtension } from "../shared/logExtension";
import { ReportPageService } from "./reportPageService";
import { Report } from "../entities/report";

@Component
export class ReportPageController extends Vue {

    private reportPageService: ReportPageService;
    private waitControl: statusIndicators.WaitControl;
    private grid: grids.Grid;
    private report: Report;
    
    public height: string = "70vh";

    public mounted() {
        this.reportPageService = new ReportPageService();
        
        this.waitControl = controls.create(statusIndicators.WaitControl, $('#waitContainer'), {
            message: "Loading..."
        });
        
        this.initializeAsync().then(() => this.refreshAsync());
        this.$el.classList.remove("hide");
    }

    private async initializeAsync() {
        this.waitControl.startWait();
        try {
            await this.createReportTable();
        } finally {
            this.waitControl.endWait();
        }
    }

    public async refreshAsync() {
        this.waitControl.startWait();
        try {
            await this.loadReportAsync();
            this.grid.setDataSource(this.report.workItems);
        } finally {
            this.waitControl.endWait();
        }
    }

    protected async createReportTable() {
        const container = $(this.$el.id);
        container.text("");
        this.grid = controls.create(grids.Grid, container,
        {
            height: this.height,
            allowMultiSelect: false,
            columns: [
                { tooltip: "Work Item ID", text: "ID", index: "id", width: 50 },
                { tooltip: "Work Item Type", text: "Work Item Type", index: "workItemType", width: 100 },
                { tooltip: "Work Item Title", text: "Title", index: "title", width: 200 },
                { tooltip: "Assigned team member", text: "Assigned To", index: "assignedTo", width: 125 },
                { tooltip: "Work Item State", text: "State", index: "state", width: 100 },
                { tooltip: "All votes per item", text: "Votes", index: "totalVotes", width: 60 },
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
    }

    protected async loadReportAsync(): Promise<void> {
        this.report =  await this.reportPageService.loadReportData();
        LogExtension.log(this.report);
    }

}