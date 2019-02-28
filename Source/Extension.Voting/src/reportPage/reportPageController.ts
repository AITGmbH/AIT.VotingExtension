import Vue from "vue";
import Component from "vue-class-component";
import * as controls from "VSS/Controls";
import * as grids from "VSS/Controls/Grids";
import { MenuBar, IMenuItemSpec } from "VSS/Controls/Menus";
import { WaitControl } from "VSS/Controls/StatusIndicator";
import { LogExtension } from "../shared/logExtension";
import { ReportPageService } from "./reportPageService";
import { Report } from "../entities/report";
import { parseEmail, bsNotify } from "../shared/common";
import { CopyToClipboardService } from "../services/copyToClipboardService";
import { ReportDisplayService } from "./reportDisplayService";

@Component
export class ReportPageController extends Vue {

    private reportPageService: ReportPageService;
    private copyToClipboardService: CopyToClipboardService;
    private grid: grids.Grid;

    public reportDisplayService: ReportDisplayService;
    public report: Report = null;
    public showContent = true;
    public waitControl: WaitControl;
    public height: string = "30vh";

    public report_grid_container: string = "report-grid-container";
    public report_menu_container: string = "report-menu-container";

    public mounted() {
        this.reportPageService = new ReportPageService();
        this.copyToClipboardService = new CopyToClipboardService();

        this.initWaitControl('#waitContainer');
        this.initializeAsync().then(() => this.refreshAsync());
        this.$el.classList.remove("hide");
    }



    public async refreshAsync(lazy: boolean = false): Promise<void> {
        this.waitControl.startWait();
        try {
            if (!lazy) {
                await this.loadReportAsync();
            }
            let dataSource = [];
            if (this.report) {
                dataSource = this.report.workItems
            }
            this.grid.setDataSource(dataSource);

        } finally {
            this.waitControl.endWait();
        }
    }

    public async copyToClipboard(): Promise<void> {
        this.waitControl.startWait();
        try {
            if (this.copyToClipboardService.copyGridContentToClipboard(this.grid)) {
                bsNotify(
                    "success",
                    "The table content was copied to your clipboard!"
                );
            } else {
                bsNotify(
                    "danger",
                    "There was an error moving the content to your clipboard! Please try again or refresh the page!"
                );
            }
        } finally {
            this.waitControl.endWait();
        }
    }

    public createNewVoting() {
        this.reportDisplayService.createNewVoting();
    }

    public initWaitControl(ele: any): WaitControl {
        if (!this.waitControl) {
            this.waitControl = controls.create(WaitControl, $(ele), {
                message: "Loading..."
            });
        }
        return this.waitControl;
    }

    protected async createMenuBar() {
        let menuItems = [] as IMenuItemSpec[];
        if (!await this.reportPageService.isVotingActive()) {
            menuItems.push({
                id: "createNewVoting",
                text: "Create new voting",
                icon: "icon icon-add",
                disabled: false
            });
        }

        menuItems.push(...[
            {
                id: "refresh",
                title: "Refresh",
                icon: "bowtie-icon bowtie-navigate-refresh",
                disabled: false
            },
            {
                separator: true
            },
            {
                id: "copy",
                title: "Copy to clipboard",
                icon: "bowtie-icon bowtie-clone",
                disabled: false
            }
        ]);

        controls.create(MenuBar, $(`#${ this.report_menu_container }`), {
            showIcon: true,
            items: menuItems,
            executeAction: (args) => {
                var command = args.get_commandName();
                switch (command) {
                    case "refresh":
                        this.refreshAsync();
                        break;
                    case "copy":
                        this.copyToClipboard();
                        break;
                    case "createNewVoting":
                        this.createNewVoting();
                        break;
                }
            }
        });
    }

    protected createReportTable() {
        const container = $(`#${ this.report_grid_container }`);
        this.grid = controls.create(grids.Grid, container,
            {
                height: this.height,
                allowMultiSelect: true,
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
                $(cellTitle).append(`<div class="work-item-color ${ cssClass }-color"></div>`);
                $(cellTitle).append(`<span>${ title }</span>`);
                $(cellAssignedTo).text(assignedTo);
            });

            observer.observe(document.getElementById(this.report_grid_container), { childList: true, subtree: true });
        });

        observer.observe(document.getElementById(this.report_grid_container), { childList: true, subtree: true });
    }

    protected async loadReportAsync(): Promise<void> {
        this.report = await this.reportPageService.loadReportData(true);
        LogExtension.log(this.report);
    }

    private async initializeAsync(): Promise<void> {
        this.waitControl.startWait();
        try {
            this.createMenuBar();
            this.createReportTable();
        } finally {
            this.waitControl.endWait();
        }
    }



}