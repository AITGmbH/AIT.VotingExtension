import { VotingTypes } from "../entities/votingTypes";

export class Voting {
    public description = "";
    public isVotingEnabled = false;
    public numberOfVotes: number = 3;
    public voteLimit: number = 1;
    public isVotingPaused = true;
    public group = "Team";
    public team: string;
    public type: string = VotingTypes.LEVEL;
    public level: string;
    public item: string;
    public query: string = "";
    public created: number;
    public lastModified: number;
    public title = "";
    public useStartTime: boolean = false;
    public start: number;
    public useEndTime: boolean = false;
    public end: number;

    public get isBacklogBased() {
        return this.type == VotingTypes.LEVEL;
    }

    public get isItemBased() {
        return this.type == VotingTypes.ITEM;
    }

    public get isQueryBased() {
        return this.type == VotingTypes.QUERY;
    }
}
