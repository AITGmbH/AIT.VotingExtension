import { Voting } from "../entities/voting";
import { LogExtension } from "../shared/logExtension";
import { getClient as getWitClient } from "TFS/WorkItemTracking/RestClient";
import { getClient as getCoreClient } from "TFS/Core/RestClient";
import { VotingDataService } from "./votingDataService";
import { getUrlParameterByName } from "../shared/common";
import { HostNavigationService } from "VSS/SDK/Services/Navigation";
import { QueryExpand, QueryType, QueryHierarchyItem } from "TFS/WorkItemTracking/Contracts";

export class BaseDataService {
    private _witTypeNames: string[] = [];
    private _flatQueryNames: any[] = [];
    private _teams: any[] = [];

    protected votingDataService: VotingDataService;
    protected template: string;
    protected process: string;
    
    constructor() {
        const teamId = getUrlParameterByName("teamId", document.referrer)
        || window.localStorage.getItem("VotingExtension.SelectedTeamId-" + this.context.project.id);
        if (teamId != null) {
            this.team = { id: teamId, name: "" };
        }
        
        this.votingDataService = new VotingDataService();
    }
    
    public get witTypeNames() {
        return this._witTypeNames;
    }

    public get flatQueryNames() {
        return this._flatQueryNames;
    }

    public get teams() {
        return this._teams;
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
        const webContext = this.context;
        const configuration = this.configuration;

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

    public async loadTeamsAsync(): Promise<void> {
        const coreClient = getCoreClient();

        try {
            this._teams = await coreClient.getTeams(this.context.project.id, false);

            LogExtension.log(this.teams);
        } catch (error) {
            LogExtension.log(error);
        }
    }

    public async loadProjectAsync(): Promise<void> {
        const coreClient = getCoreClient();

        try {
            const project = await coreClient.getProject(this.context.project.id, true);
            this.process = project.capabilities.processTemplate.templateName;

            LogExtension.log(project);
        } catch (error) {
            LogExtension.log(error);
        }
    }

    public async loadWitTypeNamesAsync(): Promise<void> {
        const witclient = getWitClient();

        try {
            const witcat = await witclient.getWorkItemTypes(this.context.project.id);
            this._witTypeNames = witcat.map(w => w.name);

            LogExtension.log(this.witTypeNames);
        } catch (error) {
            LogExtension.log(error);
        }
    }

    public async loadFlatQueryNamesAsync(): Promise<void> {
        const witClient = getWitClient();
        const that = this;

        function recursiveSearch(items: QueryHierarchyItem[]) {
            for (let item of items) {
                if (!item.isPublic) {
                    continue;
                }
                else if (item.isFolder) {
                    recursiveSearch(item.children);
                }
                else if (item.queryType == QueryType.Flat){
                    that._flatQueryNames.push({ 'id':item.id, 'path':item.path });
                }
            }
        }
        
        try {
            const queries = await witClient.getQueries(this.context.project.id, QueryExpand.None, 2); //An SQL query might be easier
            this._flatQueryNames = [];
            recursiveSearch(queries);

            LogExtension.log(this.flatQueryNames);
        } catch (error) {
            LogExtension.log(error);
        }
    }

    public async getQueryById(id: string): Promise<QueryHierarchyItem> {
        const witClient = getWitClient();
        return witClient.getQuery(this.context.project.id, id, QueryExpand.Wiql);
    }

    public async loadVotingAsync(): Promise<Voting> {
        const doc = await this.votingDataService.getDocumentAsync(this.documentId);
        LogExtension.log(doc);

        if (doc.voting == null) {
            return new Voting();
        } else {
            return doc.voting;
        }
    }

    public async loadGreedyAsync() {
        await this.loadProjectAsync();
        await this.loadTeamsAsync();
        await this.loadWitTypeNamesAsync();
        await this.loadFlatQueryNamesAsync();
        await this.loadVotingAsync();
    }
}