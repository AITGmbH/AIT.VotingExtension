import Vue from "vue";
import Component from "vue-class-component";
import * as controls from "VSS/Controls";
import * as navigation from "VSS/Controls/Navigation";
import { TeamFilterService } from "./teamFilterService";
import { TeamFilterDisplayService } from "./teamFilterDisplayService";

@Component
export class TeamFilterController extends Vue {

    private teamFilterService: TeamFilterService;
    private teamFilterDisplayService: TeamFilterDisplayService;

    public mounted() {
        this.teamFilterService = new TeamFilterService();
        this.initAsync();
    }

    private async initAsync() {
        await this.teamFilterService.loadTeamsAsync();
        this.generateTeamPivot();
    }


    private generateTeamPivot() {
        controls.create(navigation.PivotFilter, $(".filter-container"), {
            behavior: "dropdown",
            text: "Team",
            items: this.teamFilterService.teams
                .map(team => {
                    return {
                        id: team.id,
                        text: team.name,
                        value: team.id,
                        selected: this.teamFilterService.team.id === team.id
                    };
                })
                .sort((a, b) => a.text.localeCompare(b.text)),
            change: item => {
                this.teamFilterService.team = item;
                this.teamFilterDisplayService.setTeam(this.teamFilterService.team);
            }
        });
    }

}