import Vue from "vue";
import Component from "vue-class-component";
import * as controls from "VSS/Controls";
import * as grids from "VSS/Controls/Grids";
import { WaitControl } from "VSS/Controls/StatusIndicator";
import { LogExtension } from "../shared/logExtension";
import { ReportPageService } from "./reportPageService";
import { Report } from "../entities/report";
import { parseEmail } from "../shared/common";

@Component
export class ReportPageController extends Vue {

    private reportPageService: ReportPageService;
    private grid: grids.Grid;

    public report: Report = null;
    public waitControl: WaitControl;
    public height: string = "30vh";
    public selector: string = null;

    public mounted() {
        this.reportPageService = new ReportPageService();
        
        this.initWaitControl('#waitContainer');
        this.initializeAsync().then(() => this.refreshAsync());
        this.$el.classList.remove("hide");
    }

    private async initializeAsync() {
        this.waitControl.startWait();
        try {

        } finally {
            this.waitControl.endWait();
        }
    }
    
    public async refreshAsync() {
        this.waitControl.startWait();
        try {
            await this.loadReportAsync();
            await this.createReportTable();
            this.grid.setDataSource(this.report.workItems);
        } finally {
            this.waitControl.endWait();
        }
    }

    protected async createReportTable() {
        if (!this.selector) {
            this.selector = this.$el.id;
        } 
        const container = $(`#${this.selector}`);
        container.text("");
        
        this.grid = controls.create(grids.Grid, container,
        {
            height: this.height,
            allowMultiSelect: false,
            source: this.report.workItems,
            columns: [
                { tooltip: "Work Item ID", text: "ID", index: "id", width: 50 },
                { tooltip: "Work Item Type", text: "Work Item Type", index: "workItemType", width: 100 },
                { tooltip: "Work Item Title", text: "Title", index: "title", width: 650 },
                { tooltip: "Assigned team member", text: "Assigned To", index: "assignedTo", width: 125 },
                { tooltip: "Work Item State", text: "State", index: "state", width: 100 },
                { tooltip: "All votes per item", text: "Votes", index: "totalVotes", width: 60 },
                { text: "Order", index: "order", width: 50, hidden: true }
            ],
            sortOrder: [
                {
                    index: "order",
                    order: "asc"
                }
            ],
            autoSort: true
        });

        const observer = new MutationObserver((_) => {
            observer.disconnect();

            $('.grid-row').each((_, element) => {
                const cellWorkItemType = $(element).find('div:nth-child(2)');
                const cellTitle = $(element).find('div:nth-child(3)');
                const cellAssignedTo = $(element).find('div:nth-child(4)');

                const title = $(cellTitle).text();
                const cssClass = $(cellWorkItemType).text().toLowerCase().replace(/\s+/g, '');
                const assignedTo = parseEmail($(cellAssignedTo).text());

                $(cellTitle).text('');
                $(cellTitle).append(`<div class="work-item-color ${cssClass}-color"></div>`);
                $(cellTitle).append(`<span> ${title}</span>`);
                $(cellAssignedTo).text(assignedTo);
            });

            observer.observe(document.getElementById(this.selector), { childList: true, subtree: true });
        });

        observer.observe(document.getElementById(this.selector), { childList: true, subtree: true });
    }

    protected async loadReportAsync(): Promise<void> {
        this.report =  await this.reportPageService.loadReportData(true);
        LogExtension.log(this.report);
    }

    public initWaitControl(ele: any): WaitControl {
        if (!this.waitControl) {
            this.waitControl = controls.create(WaitControl, $(ele), {
                message: "Loading..."
            });
        } 
        return this.waitControl;
    }

}