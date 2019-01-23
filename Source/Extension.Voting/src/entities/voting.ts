export class Voting {
    public description = "";
    public isVotingEnabled = false;
    public numberOfVotes: number = 3; 
    public isVotingPaused = false;
    public isMultipleVotingEnabled = false;
    public group = "Team";
    public team: string;
    public type: string;
    public level: string;
    public query: string;
    public created: number;
    public lastModified: number;
    public title = "";
}
