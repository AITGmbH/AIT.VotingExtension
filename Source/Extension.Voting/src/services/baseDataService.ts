import { Voting } from "../entities/voting";
import { VotingStatus } from "../entities/votingStatus";
import { LogExtension } from "../shared/logExtension";
import { getClient as getWitClient } from "TFS/WorkItemTracking/RestClient";
import { getClient as getCoreClient } from "TFS/Core/RestClient";
import { VotingDataService } from "./votingDataService";
import { getUrlParameterByName } from "../shared/common";
import { HostNavigationService } from "VSS/SDK/Services/Navigation";

export class BaseDataService {
    private _witFieldNames: string[] = [];

    protected votingDataService: VotingDataService;
    protected template: string;
    protected process: string;

    public excludes: string[] = [];
    public teams: any[] = [];

    public get witFieldNames() {
        return this._witFieldNames.filter(w => this.excludes.indexOf(w) < 0);
    }

    constructor() {
        const teamId = getUrlParameterByName("teamId", document.referrer)
            || window.localStorage.getItem("VotingExtension.SelectedTeamId-" + VSS.getWebContext().project.id);
        if (teamId != null) {
            this.team = { id: teamId, name: "" };
        }

        this.votingDataService = new VotingDataService();
    }

    public get documentId() {
        return this.extensionContext.extensionId + "_" + this.team.id;
    }

    public get context() {
        return VSS.getWebContext();
    }

    public get configuration() {
        return VSS.getConfiguration();
    }

    public get extensionContext() {
        return VSS.getExtensionContext();
    }

    public get team(): TeamContext {
        let webContext = this.context;
        let configuration = this.configuration;

        if ("team" in configuration) {
            return configuration.team;
        } else if ("team" in webContext) {
            return webContext.team;
        } else {
            return null;
        }
    }

    public set team(team: TeamContext) {
        this.configuration.team = team;

        VSS.getService(VSS.ServiceIds.Navigation).then((navigationService: HostNavigationService) => {
            navigationService.updateHistoryEntry(null, { teamId: team.id });
        });

        window.localStorage.setItem("VotingExtension.SelectedTeamId-" + this.context.project.id, team.id);
    }

    public getTemplate(): string {
        switch (this.process) {
            case "CMMI":
                return "Microsoft.VSTS.Common.StackRank";
            case "Agile":
                return "Microsoft.VSTS.Common.StackRank";
            case "Scrum":
                return "Microsoft.VSTS.Common.BacklogPriority";
            default:
                return "Microsoft.VSTS.Common.StackRank";
        }
    }

    public reload() {
        window.location.href = window.location.href;
    }

    public async loadAsync() {
        await this.loadProjectAsync();
        await this.loadTeamsAsync();
    }

    public async loadTeamsAsync(): Promise<void> {
        var coreClient = getCoreClient();

        try {
            this.teams = await coreClient.getTeams(this.context.project.id, false);

            LogExtension.log(this.teams);
        } catch (error) {
            LogExtension.log(error);
        }
    }

    public async loadProjectAsync(): Promise<void> {
        var coreClient = getCoreClient();

        try {
            const project = await coreClient.getProject(this.context.project.id, true);
            this.process = project.capabilities.processTemplate.templateName;

            LogExtension.log(project);
        } catch (error) {
            LogExtension.log(error);
        }
    }

    public async loadWITFieldNamesAsync(): Promise<void> {
        var witclient = getWitClient();

        try {
            const witcat = await witclient.getWorkItemTypes(this.context.project.id);
            this._witFieldNames = witcat.map(w => w.name);

            LogExtension.log(this.witFieldNames);
        } catch (error) {
            LogExtension.log(error);
        }
    }

    public async loadVotingAsync(): Promise<Voting> {
        var doc = await this.votingDataService.getDocumentAsync(this.documentId);
        LogExtension.log(doc);

        this.excludes = doc.excludes || [];

        if (doc.voting == null) {
            return new Voting();
        } else {
            return doc.voting;
        }
    }
}