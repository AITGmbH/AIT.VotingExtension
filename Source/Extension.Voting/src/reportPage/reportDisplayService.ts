export class ReportDisplayService {
    public reportVisible;
    constructor() {
        this.reportVisible = false;
    }

    public setReportVisibility(value: boolean) {
        this.reportVisible = value;
    }
}