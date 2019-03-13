import Vue from "vue";

export class ReportDisplayService {
    public reportVisible;
    public eventBus = new Vue();
    constructor() {
        this.reportVisible = false;
    }

    public setReportVisibility(value: boolean) {
        this.reportVisible = value;
        if (value) {
            this.eventBus.$emit("showReport");
        }
    }

    public subscribeToShowReport(callback: Function) {
        this.eventBus.$on("showReport", callback);
    }

    public createNewVoting() {
        this.eventBus.$emit("createNewVoting");
    }

    public subscribeToCreateNewVoting(callback: Function) {
        this.eventBus.$on("createNewVoting", callback);
    }
}