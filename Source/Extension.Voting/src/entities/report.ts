import { User } from "./user";
import { ReportItem } from "./reportItem";

export class Report {
    name: string;
    workItemTypeName: string;
    title: string;
    description: string;

    workItemArray: ReportItem[];

    userlist: User[];

    addVote(itemId: number) {
        this.workItemArray.find(x => x.id == itemId).totalVotes++;
    }
}