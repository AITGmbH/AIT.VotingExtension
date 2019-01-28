import { Voting } from "../entities/voting";
import { TinyRequirement } from "../entities/tinyRequirement";
import { LogExtension } from "../shared/logExtension";
import { getClient as getWitClient } from "TFS/WorkItemTracking/RestClient";
import { getClient as getCoreClient } from "TFS/Core/RestClient";
import { getClient as getWorkClient } from "TFS/Work/RestClient";
import { TeamContext as TFSTeamContext } from "TFS/Core/Contracts";
import { VotingDataService } from "./votingDataService";
import { getUrlParameterByName } from "../shared/common";
import { HostNavigationService } from "VSS/SDK/Services/Navigation";

export class BaseDataService {
    public assignedToUnassignedText: string = "";

    private _witFieldNames: string[] = [];

    protected votingDataService: VotingDataService;
    protected template: string;
    protected process: string;

    public excludes: string[] = [];
    public teams: any[] = [];
    
    constructor() {
        const teamId = getUrlParameterByName("teamId", document.referrer)
        || window.localStorage.getItem("VotingExtension.SelectedTeamId-" + this.context.project.id);
        if (teamId != null) {
            this.team = { id: teamId, name: "" };
        }
        this.votingDataService = new VotingDataService();
    }
    
    public get witFieldNames() {
        return this._witFieldNames.filter(w => this.excludes.indexOf(w) < 0);
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

    public async loadAreasAsync() : Promise<string> {
        const client = getWorkClient();
        let areas = "AND ( ";

        const teamcontext: TFSTeamContext = {
            project: null,
            projectId: this.context.project.id,
            team: null,
            teamId: this.team.id,
        };

        const teamfieldvalues = await client.getTeamFieldValues(teamcontext);
        LogExtension.log(teamfieldvalues);

        for (let i = 0; i < teamfieldvalues.values.length; i++) {
            const value = teamfieldvalues.values[i];
            areas += `[System.AreaPath] ${value.includeChildren ? "UNDER" : "="} '${value.value}'`;

            if (i < (teamfieldvalues.values.length - 1)) {
                areas += " OR ";
            } else {
                areas += " )";
            }
        }

        LogExtension.log(areas);
        LogExtension.log("finish area");
        return areas;
    }

    public async loadRequirementsAsync(level: string, areas: string): Promise<TinyRequirement[]>{
        let requirements = new Array<TinyRequirement>();
        
        const wiql = "SELECT [System.Id] FROM WorkItems WHERE [System.State] <> 'Closed' AND [System.State] <> 'Done' AND [System.State] <> 'Removed'"
            + " AND [System.WorkItemType] = '" + level + "' " + areas;
        const wiqlJson = {
            query: wiql,
        };

        LogExtension.log("WIQL-Abfrage: " + wiql);

        const idJson = await getWitClient().queryByWiql(wiqlJson, this.context.project.id);
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

                const result = await getWitClient().getWorkItems(array);
                for (const req of result) {
                    LogExtension.log(req);
                    const tempRequirement = this.createTinyRequirement(req);
                    requirements.push(tempRequirement);
                }
            } catch (err) {
                LogExtension.log("Error at getWorkItems()");
                LogExtension.log(err);
            }
        }
        return requirements;
    }

    public async getWorkItemsAsync(ids: number[]) : Promise<TinyRequirement[]> {
        const workitems = new Array<TinyRequirement>();
        
        if (ids.length == 0) {
            return workitems;
        }

        const client = getWitClient();
        const items = await client.getWorkItems(ids);

        items.forEach(item => {
            const tinyItem = this.createTinyRequirement(item);
            workitems.push(tinyItem);
        });

        return workitems;
    }

    private createTinyRequirement(req: any): TinyRequirement {
        const tempRequirement = new TinyRequirement();
        tempRequirement.id = req.id;
        if (req.fields["Microsoft.VSTS.Common.StackRank"] !== undefined) {
            tempRequirement.order = req.fields["Microsoft.VSTS.Common.StackRank"];
        } else if (req.fields["Microsoft.VSTS.Common.BacklogPriority"] !== undefined) {
            tempRequirement.order = req.fields["Microsoft.VSTS.Common.BacklogPriority"];
        } else {
            tempRequirement.order = "0";
        }
        tempRequirement.title = req.fields["System.Title"];
        tempRequirement.workItemType = req.fields["System.WorkItemType"];
        tempRequirement.state = req.fields["System.State"];
        tempRequirement.size = req.fields["Microsoft.VSTS.Scheduling.Size"];
        tempRequirement.valueArea = req.fields["Microsoft.VSTS.Common.BusinessValue"];
        tempRequirement.iterationPath = req.fields["System.IterationPath"];
        tempRequirement.assignedTo = this.getNameOfWiResponsiveness(req);
        tempRequirement.description = req.fields["System.Description"];

        return tempRequirement;
    }

    private getNameOfWiResponsiveness(req: any): string {
        const assignedTo = req.fields['System.AssignedTo'];
        return assignedTo ? assignedTo : this.assignedToUnassignedText;
    }
}