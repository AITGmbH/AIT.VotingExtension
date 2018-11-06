import { TinyRequirement } from "./TinyRequirement";

export class VotingItem extends TinyRequirement {
    public myVotes: number;
    public vote?: string;
    public allVotes: number;
    public userId?: string;
}