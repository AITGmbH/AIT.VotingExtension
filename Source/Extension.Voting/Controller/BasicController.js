///<reference path="BasicDataController.ts"/>
///<reference path="../Entities/Voting.ts"/>
///<reference path="../Entities/User.ts"/>
/// <reference types="vss-web-extension-sdk" />
///<summary>
///Controller class with functions which 
///are used by the VotingpageController
///and also by the AdminpageController
///</summary>
var BasicController = /** @class */ (function () {
    function BasicController() {
    }
    BasicController.prototype.setAttributes = function (context) {
        this.context = context;
        this.user = new User();
        this.user.Id = context.user.id;
        this.user.Name = context.user.name;
        this.user.Email = context.user.email;
        this.user.UniqueName = context.user.uniqueName;
        this.user.Team = context.team.id;
        this.user.IsAdmin = true; // context.team.userIsAdmin;
    };
    Object.defineProperty(BasicController.prototype, "ActualVoting", {
        get: function () {
            return this.actualVoting;
        },
        set: function (value) {
            this.actualVoting = value;
        },
        enumerable: true,
        configurable: true
    });
    return BasicController;
}());
