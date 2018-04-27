///<summary>
/// image of a single Requirement
/// has only a few Informations 
/// which are necessary for the Voting
/// not persisted
///</summary>
var TinyRequirement = /** @class */ (function () {
    function TinyRequirement() {
    }
    Object.defineProperty(TinyRequirement.prototype, "Id", {
        get: function () {
            return this.id;
        },
        set: function (value) {
            this.id = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TinyRequirement.prototype, "Order", {
        get: function () {
            return this.order;
        },
        set: function (value) {
            this.order = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TinyRequirement.prototype, "WorkItemType", {
        get: function () {
            return this.workItemType;
        },
        set: function (value) {
            this.workItemType = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TinyRequirement.prototype, "Title", {
        get: function () {
            return this.title;
        },
        set: function (value) {
            this.title = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TinyRequirement.prototype, "State", {
        get: function () {
            return this.state;
        },
        set: function (value) {
            this.state = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TinyRequirement.prototype, "Size", {
        get: function () {
            return this.size;
        },
        set: function (value) {
            this.size = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TinyRequirement.prototype, "RequirementType", {
        get: function () {
            return this.requirementType;
        },
        set: function (value) {
            this.requirementType = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TinyRequirement.prototype, "ValueArea", {
        get: function () {
            return this.valueArea;
        },
        set: function (value) {
            this.valueArea = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TinyRequirement.prototype, "IterationPath", {
        get: function () {
            return this.iterationPath;
        },
        set: function (value) {
            this.iterationPath = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TinyRequirement.prototype, "AssignedTo", {
        get: function () {
            return this.assignedTo;
        },
        set: function (value) {
            this.assignedTo = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TinyRequirement.prototype, "Description", {
        get: function () {
            return this.description;
        },
        set: function (value) {
            this.description = value;
        },
        enumerable: true,
        configurable: true
    });
    return TinyRequirement;
}());
