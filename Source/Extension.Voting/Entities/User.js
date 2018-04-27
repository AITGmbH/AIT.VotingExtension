///<summary>
/// image of a User
/// not persisted
///</summary>
var User = /** @class */ (function () {
    function User() {
    }
    Object.defineProperty(User.prototype, "Id", {
        get: function () {
            return this.id;
        },
        set: function (value) {
            this.id = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "Email", {
        get: function () {
            return this.email;
        },
        set: function (value) {
            this.email = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "Name", {
        get: function () {
            return this.name;
        },
        set: function (value) {
            this.name = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "UniqueName", {
        get: function () {
            return this.uniqueName;
        },
        set: function (value) {
            this.uniqueName = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "Team", {
        get: function () {
            return this.team;
        },
        set: function (value) {
            this.team = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "IsAdmin", {
        get: function () {
            return this.isAdmin;
        },
        set: function (value) {
            this.isAdmin = value;
        },
        enumerable: true,
        configurable: true
    });
    return User;
}());
