import { getClient as getWitClient } from "TFS/WorkItemTracking/RestClient";
import { getClient as getCoreClient } from "TFS/Core/RestClient";
import { getClient as getWorkClient } from "TFS/Work/RestClient";
import { TeamContext as CoreTeamContext } from "TFS/Core/Contracts";
import { getUrlParameterByName } from "../shared/common";
import { HostNavigationService } from "VSS/SDK/Services/Navigation";
import { LogExtension } from "../shared/logExtension";
import { QueryExpand, QueryHierarchyItem, QueryType } from "TFS/WorkItemTracking/Contracts";
import { Voting } from "../entities/voting";
import { VotingDataService } from "./votingDataService";
import { TinyRequirement } from "../entities/TinyRequirement";
import { Vote } from "../entities/vote";

export class BaseDataService {
    private _areas: string;
    private _witTypeNames: string[] = [];
    private _witLevelNames: IdToName[] = [];
    private _flatQueryNames: IdToName[] = [];
    private _teams: TeamContext[] = [];
    private _requirements: TinyRequirement[] = [];

    protected votingDataService: VotingDataService;
    protected template: string;
    protected process: string;

    public assignedToUnassignedText: string = "";
    public votes: Vote[];
    public nothingToVote: (isThereAnythingToVote: boolean) => void;

    public get requirements(): TinyRequirement[] {
        return this._requirements;
    }

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

    public async getQueryByIdAsync(
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
            if (doc.vote) {
                if (doc.vote.length > 0) {
                    return true
                }
            }
        }
        return false;
    }

    public getNameOfWiResponsiveness(name: string): string {
        return name === undefined ? "" : name.replace(/\<.*\>/, "").trim();
    }
    
    public async getAreasAsync(): Promise<void> {
        const client = getWorkClient();
        let areas = "( ";

        const teamcontext: CoreTeamContext = {
            project: null,
            projectId: this.context.project.id,
            team: null,
            teamId: this.team.id
        };

        const teamfieldvalues = await client.getTeamFieldValues(teamcontext);
        LogExtension.log(teamfieldvalues);

        for (let i = 0; i < teamfieldvalues.values.length; i++) {
            const value = teamfieldvalues.values[i];
            areas += `[System.AreaPath] ${
                value.includeChildren ? "UNDER" : "="
                } '${ value.value }'`;

            if (i < teamfieldvalues.values.length - 1) {
                areas += " OR ";
            } else {
                areas += " )";
            }
        }

        LogExtension.log(areas);
        this._areas = areas;
        LogExtension.log("finish area");
    }

    

    /**
     * Loads WorkItems by list of WorkItemTypes (backlog-level-based).
     *
     * @param type A comma separated string of required WorkItemTypes. Example: "Requirement,Bug"
     * @see VotingTypes
     */
    public async loadWorkItemsByTypesAsync(types: string = ""): Promise<void> {
        const wiql =
            "SELECT [System.Id] FROM WorkItems" +
            " WHERE [System.State] <> 'Closed'" +
            " AND [System.State] <> 'Done'" +
            " AND [System.State] <> 'Removed'" +
            " AND ( [System.WorkItemType] = '" +
            types.replace(",", "' OR [System.WorkItemType] = '") +
            "' )" +
            " AND " +
            this._areas;

        return this.loadWorkItemsAsync(wiql);
    }

    /**
     * Loads WorkItems based on a Query.
     *
     * @param queryId Id of a query.
     * @see VotingTypes
     */
    public async loadWorkItemsByQueryAsync(queryId: string): Promise<void> {
        const query = await this.getQueryByIdAsync(queryId);
        return this.loadWorkItemsAsync(query.wiql);
    }

    /**
     * Loads WorkItems based on a WIQL string.
     *
     * @param wiql Id of a query or comma separated string of required WorkItemTypes.
     */
    private async loadWorkItemsAsync(wiql: string): Promise<void> {
        this._requirements = new Array<TinyRequirement>();
        const witClient = getWitClient();

        const wiqlJson = {
            query: wiql
        };

        LogExtension.log("WIQL-Abfrage: " + wiql);

        const idJson = await witClient.queryByWiql(
            wiqlJson,
            this.context.project.id
        );
        LogExtension.log(idJson);
        const headArray = new Array();
        let tempArray = new Array();
        LogExtension.log(idJson.workItems);
        for (let i = 0; i < idJson.workItems.length; i++) {
            const item = idJson.workItems[i];

            if ((i + 1) % 200 !== 0) {
                tempArray.push(item.id);
            } else {
                headArray.push(tempArray);
                tempArray = new Array<string>();
                tempArray.push(item.id);
            }
        }

        headArray.push(tempArray);

        for (const array of headArray) {
            try {
                if (array == null || array.length == 0) {
                    continue;
                }

                const result = await witClient.getWorkItems(array);
                for (const req of result) {
                    LogExtension.log(req);

                    const tempRequirement = new TinyRequirement();
                    tempRequirement.id = req.id;
                    if (
                        req.fields["Microsoft.VSTS.Common.StackRank"] !==
                        undefined
                    ) {
                        tempRequirement.order =
                            req.fields["Microsoft.VSTS.Common.StackRank"];
                    } else if (
                        req.fields["Microsoft.VSTS.Common.BacklogPriority"] !==
                        undefined
                    ) {
                        tempRequirement.order =
                            req.fields["Microsoft.VSTS.Common.BacklogPriority"];
                    } else {
                        tempRequirement.order = "0";
                    }
                    tempRequirement.title = req.fields["System.Title"];
                    tempRequirement.workItemType =
                        req.fields["System.WorkItemType"];
                    tempRequirement.state = req.fields["System.State"];
                    tempRequirement.size =
                        req.fields["Microsoft.VSTS.Scheduling.Size"];
                    tempRequirement.valueArea =
                        req.fields["Microsoft.VSTS.Common.BusinessValue"];
                    tempRequirement.iterationPath =
                        req.fields["System.IterationPath"];
                    tempRequirement.assignedTo = this.getNameOfWiResponsiveness(
                        req.fields["System.AssignedTo"]);
                    tempRequirement.createdBy = this.getNameOfWiResponsiveness(
                        req.fields["System.CreatedBy"]);                        
                    tempRequirement.assignedToFull = req.fields["System.AssignedTo"];
                    tempRequirement.createdByFull = req.fields["System.CreatedBy"];
                    tempRequirement.description =
                        req.fields["System.Description"];
                    tempRequirement.link = this.getWebLinkToWi(req);

                    this.requirements.push(tempRequirement);
                }
            } catch (err) {
                LogExtension.log("Error at getWorkItems()");
                LogExtension.log(err);
                this.nothingToVote(false);
            }
        }
    }

    private getWebLinkToWi(req: any): string {
        if (req._links) {
            return req._links.html.href ? req._links.html.href : req.url;
        }
        return "";
    }

    public async loadVotesAsync() {
        const doc = await this.votingDataService.getDocumentAsync(
            this.documentId
        );
        this.votes = [];

        if (doc.vote != null && doc.vote.length > 0) {
            this.votes = doc.vote;
        }
    }

    public resetRequirements() {
        this._requirements = [];
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
