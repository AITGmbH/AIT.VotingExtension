///<summary>
/// image of a single Vote
/// persistentily stored
///</summary>

class Vote {
        //Attributes
        private id: number;
        private userId: string;
        private votingId: string;
        private workItemId: string;

        //Get- & Set-Methods
        set Id(value: number) {
            this.id = value;
        }
        get Id(): number {
            return this.id;
        }

        set UserId(value: string) {
            this.userId = value;
        }
        get UserId(): string {
            return this.userId;
        }

        set VotingId(value: string) {
            this.votingId = value;
        }
        get VotingId(): string {
            return this.votingId;
        }

        set WorkItemId(value: string) {
            this.workItemId = value;
        }
        get WorkItemId(): string {
            return this.workItemId;
        }
    }
