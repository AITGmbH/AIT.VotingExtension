import { Voting } from "../entities/voting";
import { User } from "../entities/user";

export class BaseController {
    protected user: User;

    public actualVoting: Voting;

    public setAttributes(userContext: UserContext, teamContext: TeamContext) {
        this.user = new User();
        this.user.id = userContext.id;
        this.user.name = userContext.name;
        this.user.email = userContext.email;
        this.user.uniqueName = userContext.uniqueName;
        this.user.team = teamContext.id;
        this.user.isAdmin = true;
    }
}