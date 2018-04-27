///<summary>
/// image of a single Voting
/// persistentily stored
///</summary>
var Voting = /** @class */ (function () {
    function Voting() {
        //Attributes
        this.description = "";
        this.isVotingEnabled = false;
        this.numberOfVotes = 3; // Version 1.0 -> hardcoded
        this.isMultipleVotingEnabled = false;
        this.isShowResultsEnabled = true;
        this.group = "Team"; //Version 1.0 -> hard coded
        this.title = "";
    }
    Object.defineProperty(Voting.prototype, "Description", {
        get: function () {
            return this.description;
        },
        //Get- & Set-Methods
        set: function (value) {
            this.description = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Voting.prototype, "IsVotingEnabled", {
        get: function () {
            return this.isVotingEnabled;
        },
        set: function (value) {
            this.isVotingEnabled = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Voting.prototype, "NumberOfVotes", {
        get: function () {
            return this.numberOfVotes;
        },
        set: function (value) {
            this.numberOfVotes = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Voting.prototype, "IsMultipleVotingEnabled", {
        get: function () {
            return this.isMultipleVotingEnabled;
        },
        set: function (value) {
            this.isMultipleVotingEnabled = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Voting.prototype, "IsShowResultsEnabled", {
        get: function () {
            return this.isShowResultsEnabled;
        },
        set: function (value) {
            this.isShowResultsEnabled = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Voting.prototype, "Group", {
        get: function () {
            return this.group;
        },
        set: function (value) {
            this.group = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Voting.prototype, "Team", {
        get: function () {
            return this.team;
        },
        set: function (value) {
            this.team = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Voting.prototype, "Level", {
        get: function () {
            return this.level;
        },
        set: function (value) {
            this.level = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Voting.prototype, "LastModified", {
        get: function () {
            return this.lastModified;
        },
        set: function (value) {
            this.lastModified = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Voting.prototype, "Created", {
        get: function () {
            return this.created;
        },
        set: function (value) {
            this.created = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Voting.prototype, "Title", {
        get: function () {
            return this.title;
        },
        set: function (value) {
            this.title = value;
        },
        enumerable: true,
        configurable: true
    });
    return Voting;
}());
