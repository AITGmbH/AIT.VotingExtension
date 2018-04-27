///<summary>
/// image of a single Vote
/// persistentily stored
///</summary>
var Vote = /** @class */ (function () {
    function Vote() {
    }
    Object.defineProperty(Vote.prototype, "Id", {
        get: function () {
            return this.id;
        },
        //Get- & Set-Methods
        set: function (value) {
            this.id = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vote.prototype, "UserId", {
        get: function () {
            return this.userId;
        },
        set: function (value) {
            this.userId = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vote.prototype, "VotingId", {
        get: function () {
            return this.votingId;
        },
        set: function (value) {
            this.votingId = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vote.prototype, "WorkItemId", {
        get: function () {
            return this.workItemId;
        },
        set: function (value) {
            this.workItemId = value;
        },
        enumerable: true,
        configurable: true
    });
    return Vote;
}());
