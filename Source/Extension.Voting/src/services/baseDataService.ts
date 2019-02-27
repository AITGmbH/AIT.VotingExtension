import { Voting } from "../entities/voting";
import { LogExtension } from "../shared/logExtension";
import { getClient as getWitClient } from "TFS/WorkItemTracking/RestClient";
import { getClient as getCoreClient } from "TFS/Core/RestClient";
import { getClient as getWorkClient } from "TFS/Work/RestClient";
import { VotingDataService } from "./votingDataService";
import { getUrlParameterByName } from "../shared/common";
import { HostNavigationService } from "VSS/SDK/Services/Navigation";
import {
    QueryExpand,
    QueryType,
    QueryHierarchyItem
} from "TFS/WorkItemTracking/Contracts";

export class BaseDataService {

    private _witTypeNames: string[] = [];
    private _witLevelNames: IdToName[] = [];
    private _flatQueryNames: IdToName[] = [];
    private _teams: TeamContext[] = [];

    protected votingDataService: VotingDataService;
    protected template: string;
    protected process: string;

    public assignedToUnassignedText: string = "";

    constructor() {
        const teamId =
            getUrlParameterByName("teamId", document.referrer) ||
            window.localStorage.getItem(
                "VotingExtension.SelectedTeamId-" +
                VSS.getWebContext().project.id
            );
        if (teamId != null) {
            this.team = {
                id: teamId,
                name: ""
            };
        }
        this.votingDataService = new VotingDataService();
    }

    // public get witFieldNames() {
    //     return this._witFieldNames.filter(w => this.excludes.indexOf(w) < 0);
    // }

    public get witTypeNames() {
        return this._witTypeNames;
    }

    public get witLevelNames() {
        return this._witLevelNames;
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

        VSS.getService(VSS.ServiceIds.Navigation).then(
            (navigationService: HostNavigationService) => {
                navigationService.updateHistoryEntry(null, { teamId: team.id });
            }
        );

        window.localStorage.setItem(
            "VotingExtension.SelectedTeamId-" + this.context.project.id,
            team.id
        );
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
            this._teams = await coreClient.getTeams(
                this.context.project.id,
                false
            );

            LogExtension.log(this.teams);
        } catch (error) {
            LogExtension.log(error);
        }
    }

    public async loadProjectAsync(): Promise<void> {
        const coreClient = getCoreClient();

        try {
            const project = await coreClient.getProject(
                this.context.project.id,
                true
            );
            this.process = project.capabilities.processTemplate.templateName;

            LogExtension.log(project);
        } catch (error) {
            LogExtension.log(error);
        }
    }

    /**
     * Loads all names of available item types.
     * Use "witTypeNames" for results.
     */
    public async loadWitTypeNamesAsync(): Promise<void> {
        const witclient = getWitClient();

        try {
            const wittyp = await witclient.getWorkItemTypes(
                this.context.project.id
            );
            this._witTypeNames = wittyp.map(w => w.name);

            LogExtension.log(this.witTypeNames);
        } catch (error) {
            LogExtension.log(error);
        }
    }

    /**
     * Loads all names of configured backlog levels.
     * Use "witLevelNames" for results.
     */
    public async loadWitLevelNamesAsync(): Promise<void> {
        try {
            const context = this.context;
            const backlogConf = await getWorkClient().getBacklogConfigurations({
                project: context.project.name,
                projectId: context.project.id,
                team: context.team.name,
                teamId: context.team.id
            });

            this._witLevelNames = backlogConf.portfolioBacklogs
                .sort((a, b) => b.rank - a.rank)
                .filter(p => !p.isHidden)
                .map(p => ({
                    id: p.workItemTypes.map(i => i.name).join(","),
                    name: p.name
                }));

            if (!backlogConf.requirementBacklog.isHidden) {
                let req = {
                    id: backlogConf.requirementBacklog.workItemTypes
                        .map(i => i.name)
                        .join(","),
                    name: backlogConf.requirementBacklog.name
                };
                this._witLevelNames.push(req);
            }

            LogExtension.log(this.witLevelNames);
        } catch (error) {
            LogExtension.log(error);
        }
    }

    /**
     * Loads all names of shared flat queries.
     * Use "flatQueryNames" for results.
     */
    public async loadFlatQueryNamesAsync(): Promise<void> {
        const witClient = getWitClient();
        const projectId = this.context.project.id;
        const that = this;

        async function recursiveSearch(item: QueryHierarchyItem) {
            if (item.hasOwnProperty('children')) {
                for (let child of item.children) {
                    await recursiveSearch(child);
                }
            } else if (item.hasChildren) {
                let child = await witClient.getQuery(
                    projectId,
                    item.id,
                    QueryExpand.None,
                    1
                );
                await recursiveSearch(child);
            } else if (item.isFolder) {
                //ignore folder without children...
            } else if (!item.isPublic) {
                //ignore non-public queries...
            } else if (item.queryType == QueryType.Flat) {
                that._flatQueryNames.push({ id: item.id, name: item.path });
            }
        }

        try {
            const queries = await witClient.getQuery(
                projectId,
                "Shared Queries",
                QueryExpand.None
            );
            this._flatQueryNames = [];
            await recursiveSearch(queries);

            LogExtension.log(this.flatQueryNames);
        } catch (error) {
            LogExtension.log(error);
        }
    }

    public async getQueryById(
        id: string,
        depth: number = 0
    ): Promise<QueryHierarchyItem> {
        const witClient = getWitClient();
        return witClient.getQuery(
            this.context.project.id,
            id,
            QueryExpand.Wiql,
            depth
        );
    }

    public async loadVotingAsync(): Promise<Voting> {
        const doc = await this.votingDataService.getDocumentAsync(
            this.documentId
        );
        LogExtension.log(doc);

        if (doc.voting == null) {
            return new Voting();
        } else {
            return doc.voting;
        }
    }

    public async votingHasVotes(): Promise<boolean> {
        const doc = await this.votingDataService.getDocumentAsync(
            this.documentId
        );
        LogExtension.log(doc);

        if (doc != null) {
            if (doc.vote.length > 0) {
                return true
            }
        }
        return false;
    }

    /**
     * Call all resources async.
     * We are greedy, arn't we?
     */
    public async loadGreedyAsync() {
        await this.loadProjectAsync();
        await this.loadTeamsAsync();
        await this.loadWitTypeNamesAsync();
        await this.loadWitLevelNamesAsync();
        await this.loadFlatQueryNamesAsync();
        await this.loadVotingAsync();
    }
}
