var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
///<summary>
/// image of a single VotingItem
/// extends the TinyRequirement class
/// necessary for the Table on the Voting-View
/// not persisted
///</summary>
var VotingItem = /** @class */ (function (_super) {
    __extends(VotingItem, _super);
    function VotingItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(VotingItem.prototype, "MyVotes", {
        get: function () {
            return this.myVotes;
        },
        set: function (value) {
            this.myVotes = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VotingItem.prototype, "AllVotes", {
        get: function () {
            return this.allVotes;
        },
        set: function (value) {
            this.allVotes = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VotingItem.prototype, "Vote", {
        get: function () {
            return this.vote;
        },
        set: function (value) {
            this.vote = value;
        },
        enumerable: true,
        configurable: true
    });
    return VotingItem;
}(TinyRequirement));
