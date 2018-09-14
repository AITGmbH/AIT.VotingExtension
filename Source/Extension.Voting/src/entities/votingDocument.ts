import { Vote } from "./vote";
import { Voting } from "./Voting";

export class VotingDocument {
    public id: string;
    public voting: Voting;
    public vote: Vote[];
    public excludes: string[];
    public _etag: number;
}