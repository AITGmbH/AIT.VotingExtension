import Vue from "vue";

export class TeamFilterDisplayService {
    private team;
    private eventBus = new Vue();
    constructor() {
        this.team = {};
    }

    public setTeam(value) {
        if (value) {
            this.team = value;
            this.eventBus.$emit("teamChanged", this.team);
        }
    }

    public subscribe(callback: Function) {
        this.eventBus.$on("teamChanged", callback);
    }
}