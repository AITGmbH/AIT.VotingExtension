import Vue from "vue";
import Component from "vue-class-component";
import * as controls from "VSS/Controls";
import * as menus from "VSS/Controls/Menus";
import * as grids from "VSS/Controls/Grids";
import * as workItemTrackingService from "TFS/WorkItemTracking/Services";
import { MenuBar } from "VSS/Controls/Menus";
import { WaitControl } from "VSS/Controls/StatusIndicator";
import { LogExtension } from "../shared/logExtension";
import { ReportPageService } from "./reportPageService";
import { Report } from "../entities/report";
import { bsNotify } from "../shared/common";
import { CopyToClipboardService } from "../services/copyToClipboardService";
import { ReportDisplayService } from "./reportDisplayService";
import { VotingTypes } from "../entities/votingTypes";

@Component
export class ReportPageController extends Vue {

    private reportPageService: ReportPageService;
    private copyToClipboardService: CopyToClipboardService;
    private grid: grids.Grid;
    private menuBar: menus.MenuBar;
    private actualVotingHasVotes: boolean = false;

    public reportDisplayService: ReportDisplayService;
    public report: Report = null;
    public showContent = true;
    public waitControl: WaitControl;
    public height: string = "70vh";

    public report_grid_container: string = "report-grid-container";
    public report_menu_container: string = "report-menu-container";

    public mounted() {
        this.reportPageService = new ReportPageService();
        this.copyToClipboardService = new CopyToClipboardService();
        this.initWaitControl('#waitContainer');

        this.initializeAsync().then(() => this.refreshAsync());
        this.$el.classList.remove("hide");

        this.reportDisplayService.subscribeToShowReport(
            async () => {
                await this.refreshAsync();
            }
        );
    }

    public async refreshAsync(): Promise<void> {
        this.actualVotingHasVotes = await this.reportPageService.votingHasVotes();
        this.waitControl.startWait();
        try {
            await this.loadReportAsync();
            let dataSource = [];
            if (this.report) {
                dataSource = this.report.workItems;
            }
            this.grid.setDataSource(dataSource);
        } finally {
            this.waitControl.endWait();
            await this.createMenuBar();

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

    private getMenuItems(): IContributedMenuItem[] {
        const items = [
            <any>{
                id: "createNewVoting",
                text: "Create new voting",
                icon: "icon icon-add",
                disabled: false
            },
            {
                separator: true,
            },
            {
                id: "applyToBacklog",
                title:
                    "Apply to backlog (this applies the order of the backlog items from the voting to your backlog)",
                icon: "icon icon-tfs-query-edit",
                disabled: !this.isApplyable()
            },
            {

                separator: true
            },
            {
                id: "copy",
                title: "Copy to clipboard",
                icon: "bowtie-icon bowtie-clone",
                disabled: false
            }];

        return items;
    }

    protected async createMenuBar() {
        if (this.menuBar == null) {
            this.menuBar = controls.create(MenuBar, $(`#${ this.report_menu_container }`), {
                showIcon: true,
                executeAction: (args) => {
                    var command = args.get_commandName();
                    this.executeMenuAction(command);
                }
            });
        }
        this.menuBar.updateItems(this.getMenuItems());
    }

    protected createReportTable() {
        const container = $(`#${ this.report_grid_container }`);
        this.grid = controls.create(grids.Grid, container,
            {
                height: this.height,
                allowMultiSelect: true,
                columns: [
                    {
                        tooltip: "Work Item ID",
                        text: "ID",
                        index: "id",
                        width: 50
                    },
                    {
                        tooltip: "Work Item Type",
                        text: "Work Item Type",
                        index: "workItemType",
                        width: 100
                    },
                    {
                        tooltip: "Work Item Title",
                        text: "Title", index: "title",
                        width: 650
                    },
                    {
                        tooltip: "Assigned team member",
                        text: "Assigned To",
                        index: "assignedTo",
                        width: 125
                    },
                    {
                        tooltip: "Work Item State",
                        text: "State",
                        index: "state",
                        width: 100
                    },
                    {
                        tooltip: "All votes per item",
                        text: "Votes",
                        index: "totalVotes",
                        width: 60
                    },
                    {
                        text: "Order",
                        index: "order",
                        width: 50,
                        hidden: true
                    }
                ],
                openRowDetail: async (index) => {
                    var item = this.grid.getRowData(index);
                    const service = await workItemTrackingService.WorkItemFormNavigationService.getService();
                    service.openWorkItem(item.id);
                },
                sortOrder: [
                    {
                        index: "totalVotes",
                        order: "desc"
                    },
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

                const title = $(cellTitle).text();
                const cssClass = $(cellWorkItemType).text().toLowerCase().replace(/\s+/g, '');

                $(cellTitle).text('');
                $(cellTitle).append(`<div class="work-item-color ${ cssClass }-color"></div>`);
                $(cellTitle).append(`<span>${ title }</span>`);
            });

            observer.observe(document.getElementById(this.report_grid_container), { childList: true, subtree: true });
        });

        observer.observe(document.getElementById(this.report_grid_container), { childList: true, subtree: true });
    }

    protected async loadReportAsync(): Promise<void> {
        try {
            this.report = await this.reportPageService.loadReportDataAsync(true);
            LogExtension.log(this.report);
        } catch {
            this.report = null;
        }
    }

    private executeMenuAction(command: string) {
        switch (command) {
            case "copy":
                this.copyToClipboard();
                break;
            case "applyToBacklog":
                this.applyToBacklogAsync();
                break;
            case "createNewVoting":
                this.createNewVoting();
                break;
        }
    }

    private async initializeAsync(): Promise<void> {
        this.waitControl.startWait();
        this.actualVotingHasVotes = await this.reportPageService.votingHasVotes();
        await this.loadReportAsync();
        try {
            this.createMenuBar();
            this.createReportTable();
        } finally {
            this.waitControl.endWait();
        }
    }

    private isApplyable() {
        return this.report.voting.type === VotingTypes.LEVEL && this.report.voting.isVotingTerminated && this.actualVotingHasVotes;
    }

    private async applyToBacklogAsync() {
        this.waitControl.startWait();

        try {
            await this.reportPageService.applyToBacklogAsync(this.report);
        } finally {
            this.waitControl.endWait();
        }
    }
}