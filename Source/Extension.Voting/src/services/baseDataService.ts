import { Voting } from "../entities/voting";
import { VotingStatus } from "../entities/votingStatus";
import { LogExtension } from "../shared/logExtension";
import { getClient as getWitClient } from "TFS/WorkItemTracking/RestClient";
import { getClient as getCoreClient } from "TFS/Core/RestClient";
import { VotingDataService } from "./votingDataService";
import { getUrlParameterByName } from "../shared/common";

export class BaseDataService {
    private _witFieldNames: string[] = [];

    protected votingDataService: VotingDataService;
    protected actualSetting: Voting;
    protected template: string;
    protected process: string;

    public excludes: string[] = [];
    public teams: any[] = [];
    
    public get witFieldNames() {
        return this._witFieldNames.filter(w => this.excludes.indexOf(w) < 0);
    }

    constructor() {
        const teamId = getUrlParameterByName("teamId", document.referrer);
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

        if (history.pushState) {
            var newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?teamId=' + team.id;
            window.history.pushState({ path: newUrl },'', newUrl);
        }
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

    public getSettings(): Voting {
        return this.actualSetting;
    }

    public reload() {
        window.location.href = window.location.href;
    }

    public async load() {
        await this.loadProject();
        await this.loadTeams();
    }

    public async loadTeams(): Promise<void> {
        var coreClient = getCoreClient();

        try {
            this.teams = await coreClient.getTeams(this.context.project.id, false);

            LogExtension.log(this.teams);
        } catch (error) {
            LogExtension.log(error);
        }
    }

    public async loadProject(): Promise<void> {
        var coreClient = getCoreClient();

        try {
            const project = await coreClient.getProject(this.context.project.id, true);
            this.process = project.capabilities.processTemplate.templateName;

            LogExtension.log(project);
        } catch (error) {
            LogExtension.log(error);
        }
    }

    public async loadWITFieldNames(): Promise<void> {
        var witclient = getWitClient();

        try {
            const witcat = await witclient.getWorkItemTypes(this.context.project.id);
            this._witFieldNames = witcat.map(w => w.name);

            LogExtension.log(this.witFieldNames);
        } catch (error) {
            LogExtension.log(error);
        }
    }

    public async loadVoting(): Promise<VotingStatus> {
        var doc = await this.votingDataService.getDocument(this.documentId);
        LogExtension.log(doc);

        if (doc == null) {
            return VotingStatus.NoVoting;
        }

        this.excludes = doc.excludes || [];

        if (doc.voting == null || !doc.voting.isVotingEnabled) {
            this.actualSetting = new Voting();
            return VotingStatus.NoActiveVoting;
        } else {
            this.actualSetting = doc.voting;
        }

        return VotingStatus.ActiveVoting;
    }
}