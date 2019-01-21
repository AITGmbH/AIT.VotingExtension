import { TinyRequirement } from "./TinyRequirement";

export class ReportItem extends TinyRequirement {
    
    constructor(tiny: TinyRequirement) {
        super();
        this.totalVotes = 0;

        this.id = tiny.id;
        this.title = tiny.title;
        this.assignedTo = tiny.assignedTo;
        this.description = tiny.description;
        this.iterationPath = tiny.iterationPath;
        this.order = tiny.order;
        this.requirementType = tiny.requirementType;
        this.size = tiny.size;
        this.state = tiny.state;
        this.valueArea = tiny.valueArea;
        this.workItemType = tiny.workItemType;
        this.assignedTo = tiny.assignedTo;
    }

    public totalVotes: number;
}
