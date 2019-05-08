import { User } from "./user";
import { ReportItem } from "./reportItem";
import { Voting } from "./voting";

export class Report {
    name: string;
    workItemTypeName: string;
    title: string;
    description: string;
    workItems: ReportItem[];
    users: User[];
    voting: Voting;
}