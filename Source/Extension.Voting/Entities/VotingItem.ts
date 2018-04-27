///<summary>
/// image of a single VotingItem
/// extends the TinyRequirement class
/// necessary for the Table on the Voting-View
/// not persisted
///</summary>
class VotingItem extends TinyRequirement{
    private myVotes: number;
    private vote: string;
    private allVotes: number;

    set MyVotes(value: number) {
        this.myVotes = value;
    }
    get MyVotes(): number {
        return this.myVotes;
    }

    set AllVotes(value: number) {
        this.allVotes = value;
    }
    get AllVotes(): number {
        return this.allVotes;
    }

    set Vote(value: string) {
        this.vote = value;
    }
    get Vote(): string {
        return this.vote;
    }
}