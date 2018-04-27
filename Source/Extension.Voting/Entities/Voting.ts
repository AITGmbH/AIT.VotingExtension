///<summary>
/// image of a single Voting
/// persistentily stored
///</summary>
class Voting {
        //Attributes
        private description ="";
        private isVotingEnabled = false;
        private numberOfVotes: number = 3; // Version 1.0 -> hardcoded
        private isMultipleVotingEnabled= false;
        private isShowResultsEnabled= true;
        private group = "Team"; //Version 1.0 -> hard coded
        private team: string;
        private level: string;
        //unique ID
        private created: number;
        private lastModified: number;
        private title = "";

        //Get- & Set-Methods
        set Description(value: string) {
            this.description = value;
        }
        get Description(): string {
            return this.description;
        }

        set IsVotingEnabled(value: boolean) {
            this.isVotingEnabled = value;
        }
        get IsVotingEnabled(): boolean {
            return this.isVotingEnabled;
        }

        set NumberOfVotes(value: number) {
            this.numberOfVotes = value;
        }

        get NumberOfVotes(): number {
            return this.numberOfVotes;
        }

        set IsMultipleVotingEnabled(value: boolean) {
            this.isMultipleVotingEnabled = value;
        }
        get IsMultipleVotingEnabled(): boolean {
            return this.isMultipleVotingEnabled;
        }
        
        set IsShowResultsEnabled(value: boolean) {
            this.isShowResultsEnabled = value;
        }

        get IsShowResultsEnabled(): boolean {
            return this.isShowResultsEnabled;
        }

        set Group(value: string) {
            this.group = value;
        }

        get Group(): string {
            return this.group;
        }

        set Team(value: string) {
            this.team = value;
        }
        get Team(): string {
            return this.team;
        }

        set Level(value: string) {
            this.level = value;
        }
        get Level(): string {
            return this.level;
        }

        set LastModified(value: number) {
            this.lastModified = value;
        }
        get LastModified(): number {
            return this.lastModified;
        }

        set Created(value: number) {
            this.created = value;
        }
        get Created(): number {
            return this.created;
        }

        set Title(value: string) {
            this.title = value;
        }
        get Title(): string {
            return this.title;
        }
    }
