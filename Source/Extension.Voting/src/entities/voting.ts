
export class Voting {
    public description = "";
    public isVotingEnabled = false;
    public numberOfVotes: number = 3; 
    public isVotingPaused = false;
    public isMultipleVotingEnabled = false;
    public group = "Team";
    public team: string;
    public level: string;
    public created: number;
    public lastModified: number;
    public title = "";
    public useStartTime: boolean;
    public start: number;
    public useEndTime: boolean;
    public end: number;
}
