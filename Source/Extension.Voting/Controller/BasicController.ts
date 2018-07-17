///<reference path="BasicDataController.ts"/>
///<reference path="../Entities/Voting.ts"/>
///<reference path="../Entities/User.ts"/>
/// <reference types="vss-web-extension-sdk" />

///<summary>
///Controller class with functions which 
///are used by the VotingpageController
///and also by the AdminpageController
///</summary>
class BasicController {
    protected context: WebContext;
    protected actualVoting: Voting;
    protected user: User;

    constructor() { }

    setAttributes(context: WebContext){
        this.context = context;
        this.user = new User();
        this.user.Id = context.user.id;
        this.user.Name = context.user.name;
        this.user.Email = context.user.email;
        this.user.UniqueName = context.user.uniqueName;
        this.user.Team = context.team.id;
        this.user.IsAdmin = true; // context.team.userIsAdmin;
    }

    public set ActualVoting(value: Voting){
        this.actualVoting = value;
    }
    public get ActualVoting(): Voting {
        return this.actualVoting;
    }
}