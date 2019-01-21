import Vue from "vue";
import Component from "vue-class-component";
import * as controls from "VSS/Controls";
import * as statusIndicators from "VSS/Controls/StatusIndicator";
import { LogExtension } from "../shared/logExtension";
import { ReportItem } from "../entities/reportItem";
import { ReportPageService } from "./reportPageService";

@Component
export class ReportPageController extends Vue {

    private reportPageService: ReportPageService;
    private waitControl: statusIndicators.WaitControl;

    public created() {
        document.getElementById("adminPage").classList.remove("hide");
    }

    public mounted() {
        this.reportPageService = new ReportPageService();

        this.waitControl = controls.create(statusIndicators.WaitControl, $('#waitContainer'), {
            message: "Loading..."
        });

        this.initializeAsync();
    }

    private async initializeAsync() {
        this.waitControl.startWait();
        try {


            this.createReportAsync(this.$el);
        } finally {
            this.waitControl.endWait();
        }
    }

    private async refreshAsync() {
        this.waitControl.startWait();
        try {


            this.createReportAsync(this.$el);
        } finally {
            this.waitControl.endWait();
        }
    }

    protected async createReportTable(container: Element, dataSource: ReportItem[]) {
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
    }

    protected async createReportAsync(container: Element): Promise<void> {
        var report =  await this.reportPageService.collectReportData();
        LogExtension.log(report);
        this.createReportTable(container, report.workItemArray);
    }

}