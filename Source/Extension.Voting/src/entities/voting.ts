export class Voting {
    public description = "";
    public isVotingEnabled = false;
    public numberOfVotes: number = 1; 
    public isMultipleVotingEnabled = false;
    public isShowResultsEnabled = true;
    public group = "Team";
    public team: string;
    public level: string;
    public created: number;
    public lastModified: number;
    public title = "";
}
