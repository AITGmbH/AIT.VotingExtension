import { User } from "./user";
import { ReportItem } from "./reportItem";

export class Report {
    name: string;
    workItemTypeName: string;
    title: string;
    description: string;
    workItems: ReportItem[];
    users: User[];
}