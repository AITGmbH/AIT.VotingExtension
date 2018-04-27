///<summary>
/// image of a single Requirement
/// has only a few Informations 
/// which are necessary for the Voting
/// not persisted
///</summary>

class TinyRequirement {
    private id: string;
    private order: string;
    private workItemType: string;
    private title: string;
    private state: string;
    private size: string;
    private requirementType: string;
    private valueArea: string;
    private iterationPath: string;
    private assignedTo: string;
    private description: string;

    set Id(value: string) {
        this.id = value;
    }
    get Id(): string {
        return this.id;
    }

    set Order(value: string) {
        this.order = value;
    }
    get Order(): string {
        return this.order;
    }

    set WorkItemType(value: string) {
        this.workItemType = value;
    }
    get WorkItemType() {
        return this.workItemType;
    }

    set Title(value: string) {
        this.title = value;
    }
    get Title(): string {
        return this.title;
    }

    set State(value: string) {
        this.state = value;
    }
    get State(): string {
        return this.state;
    }

    set Size(value: string) {
        this.size = value;
    }
    get Size(): string {
        return this.size;
    }

    set RequirementType(value: string) {
        this.requirementType = value;
    }
    get RequirementType(): string {
        return this.requirementType;
    }

    set ValueArea(value: string) {
        this.valueArea = value;
    }
    get ValueArea(): string {
        return this.valueArea;
    }

    set IterationPath(value: string) {
        this.iterationPath = value;
    }
    get IterationPath(): string {
        return this.iterationPath;
    }

    set AssignedTo(value: string) {
        this.assignedTo = value;
    }
    get AssignedTo(): string {
        return this.assignedTo;
    }

    set Description(value: string) {
        this.description = value;
    }
    get Description(): string {
        return this.description;
    }
}