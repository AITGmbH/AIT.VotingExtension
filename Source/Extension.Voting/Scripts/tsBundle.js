var Voting = (function () {
    function Voting() {
        this.description = "";
        this.isVotingEnabled = false;
        this.numberOfVotes = 3;
        this.isMultipleVotingEnabled = false;
        this.isShowResultsEnabled = true;
        this.group = "Team";
        this.title = "";
    }
    Object.defineProperty(Voting.prototype, "Description", {
        get: function () {
            return this.description;
        },
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
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Voting.prototype, "Group", {
        get: function () {
            return this.group;
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
})();
var User = (function () {
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
})();
var TinyRequirement = (function () {
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
})();
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VotingItem = (function (_super) {
    __extends(VotingItem, _super);
    function VotingItem() {
        _super.apply(this, arguments);
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
})(TinyRequirement);
var Vote = (function () {
    function Vote() {
    }
    Object.defineProperty(Vote.prototype, "Id", {
        get: function () {
            return this.id;
        },
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
})();
var BasicDataController = (function () {
    function BasicDataController() {
    }
    BasicDataController.prototype.loadWebContext = function () {
        this.webContext = VSS.getWebContext();
        this.extensionContext = VSS.getExtensionContext();
    };
    BasicDataController.prototype.getWebContext = function () {
        return this.webContext;
    };
    BasicDataController.prototype.setDocumentId = function (teamId) {
        this.documentId = this.extensionContext.extensionId + "_" + teamId;
    };
    BasicDataController.prototype.getDocumentId = function () {
        return this.documentId;
    };
    BasicDataController.prototype.getWITFieldNames = function () {
        var _this = this;
        if (this.witFieldNames != undefined) {
            return this.witFieldNames;
        }
        async.series([function (callback) { _this.loadWITFieldNames(callback); }], function (err) {
            if (err != null) {
                LogExtension.log(err);
                return new Error("noFields");
            }
            else {
                return _this.witFieldNames;
            }
        });
    };
    BasicDataController.prototype.getTemplate = function () {
        var _this = this;
        LogExtension.log("before load in getTemplate()", this.template);
        if (this.template == undefined) {
            $.each(this.witFieldNames, function (index, field) {
                switch (field) {
                    case "User Story":
                        _this.template = "Agile";
                        break;
                    case "Requirement":
                        _this.template = "CMMI";
                        break;
                    case "Product Backlog Item":
                        _this.template = "Scrum";
                    default:
                        break;
                }
            });
        }
        return this.template;
    };
    BasicDataController.prototype.getSettings = function () {
        return this.actualSetting;
    };
    BasicDataController.prototype.reload = function () {
        window.location.href = window.location.href;
    };
    BasicDataController.prototype.loadWITFieldNames = function (asyncCallback) {
        var _this = this;
        VSS.require(["TFS/WorkItemTracking/RestClient"], function (client) {
            var witclient = client.getClient();
            witclient.getWorkItemTypeCategories(_this.webContext.project.id).then(function (witcat) {
                _this.witFieldNames = new Array();
                $.each(witcat, function (ix, cat) {
                    switch (cat.referenceName) {
                        case "Microsoft.BugCategory":
                            $.each(cat.workItemTypes, function (x, wit) {
                                _this.witFieldNames.push(wit.name.toString());
                            });
                            break;
                        case "Microsoft.EpicCategory":
                            $.each(cat.workItemTypes, function (x, wit) {
                                _this.witFieldNames.push(wit.name.toString());
                            });
                            break;
                        case "Microsoft.FeatureCategory":
                            $.each(cat.workItemTypes, function (x, wit) {
                                _this.witFieldNames.push(wit.name.toString());
                            });
                            break;
                        case "Microsoft.RequirementCategory":
                            $.each(cat.workItemTypes, function (x, wit) {
                                _this.witFieldNames.push(wit.name.toString());
                            });
                            break;
                        default:
                            break;
                    }
                });
                LogExtension.log(_this.witFieldNames);
                asyncCallback();
            }, function (error) {
                LogExtension.log(error);
                asyncCallback(error);
            });
        });
    };
    BasicDataController.prototype.loadVoting = function (asyncCallback) {
        var _this = this;
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function (service) {
            service.getDocument(_this.webContext.collection.name, _this.documentId).then(function (doc) {
                LogExtension.log(doc);
                var votingArray;
                if (JSON.stringify(doc.voting) == "[]") {
                    _this.actualSetting = new Voting();
                    return asyncCallback(new Error("noVotingActive"));
                }
                else {
                    votingArray = new Array();
                    $.each(doc.voting, function (index, data) {
                        var temp = new Voting();
                        temp.Created = parseInt(data.created);
                        temp.LastModified = parseInt(data.lastModified);
                        temp.Title = data.title;
                        temp.Description = data.description;
                        temp.Group = data.group;
                        temp.Team = data.team;
                        temp.NumberOfVotes = parseInt(data.numberOfVotes);
                        temp.Level = data.level;
                        if (data.votingEnabled.toString() == "true") {
                            temp.IsVotingEnabled = true;
                        }
                        if (data.multipleVoting.toString() == "true") {
                            temp.IsMultipleVotingEnabled = true;
                        }
                        if (data.showResult.toString() == "true") {
                            temp.IsShowResultsEnabled = true;
                        }
                        votingArray.push(temp);
                    });
                    LogExtension.log("after each");
                    if (votingArray.length >= 1) {
                        LogExtension.log("more than one voting");
                        var actualVoting = votingArray[0];
                        for (var i = 1; i < votingArray.length; i++) {
                            if (actualVoting.LastModified < votingArray[i].LastModified) {
                                actualVoting = votingArray[i];
                            }
                        }
                        if (actualVoting.IsVotingEnabled) {
                            LogExtension.log(actualVoting.IsVotingEnabled);
                            _this.actualSetting = actualVoting;
                            return asyncCallback();
                        }
                        else {
                            LogExtension.log("voting inactive");
                            return asyncCallback(new Error("noVotingActive"));
                        }
                    }
                    else {
                        return asyncCallback(new Error("noVotingActive"));
                    }
                }
            }, function (error) {
                LogExtension.log("Error occured: ", error);
                return asyncCallback(new Error("noVoting"));
            });
        });
    };
    return BasicDataController;
})();
var AdminpageDataController = (function (_super) {
    __extends(AdminpageDataController, _super);
    function AdminpageDataController(controller) {
        _super.call(this);
        this.controller = controller;
    }
    AdminpageDataController.prototype.createNewVoting = function (asyncCallback) {
        var _this = this;
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function (service) {
            var newDoc = {
                id: _this.documentId,
                voting: [],
                vote: [],
                _etag: -1
            };
            service.createDocument(_this.webContext.collection.name, newDoc).then(function (cDoc) {
                LogExtension.log("Doc id: " + cDoc.id);
                _this.actualSetting = new Voting();
                return asyncCallback();
            }, function (error) {
                LogExtension.log(error);
                return asyncCallback(new Error("cannot create Document"));
            });
        });
    };
    AdminpageDataController.prototype.saveVoting = function (settings, onoff) {
        var _this = this;
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function (service) {
            service.getDocument(_this.webContext.collection.name, _this.documentId).then(function (doc) {
                doc.voting.push(JSON.parse(settings));
                service.updateDocument(_this.webContext.collection.name, doc).then(function (uDoc) {
                    LogExtension.log("saveVoting: document updated", uDoc.id);
                    if (onoff) {
                        bsNotify("success", "Your settings has been saved");
                    }
                    else {
                        bsNotify("success", "Your voting has been stopped");
                    }
                }, function (error) {
                    LogExtension.log("Error occured: ", error);
                    var newDoc = {
                        id: _this.documentId,
                        voting: [],
                        vote: [],
                        _etag: -1
                    };
                    service.createDocument(_this.webContext.collection.name, newDoc).then(function (cDoc) {
                        LogExtension.log("Doc id: " + cDoc.id);
                        cDoc.voting.push(JSON.parse(settings));
                        service.updateDocument(_this.webContext.collection.name, doc).then(function (uDoc) {
                            LogExtension.log("saveVoting: document updated", uDoc.id);
                            if (onoff) {
                                bsNotify("success", "Your settings has been saved");
                            }
                            else {
                                bsNotify("success", "Your voting has been stopped");
                            }
                        });
                    }, function (err) {
                        LogExtension.log(err);
                        bsNotify("danger", "Something went wrong. Try to reload page and do it again");
                    });
                });
            }, function (error) {
                LogExtension.log("Save settings, loading document", error);
                bsNotify("danger", "Internal connection problems occured, so your settings couldn't be saved.\nPlease refresh the page and try it again");
            });
        });
    };
    return AdminpageDataController;
})(BasicDataController);
var BasicController = (function () {
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
        this.user.IsAdmin = context.team.userIsAdmin;
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
})();
var AdminpageController = (function (_super) {
    __extends(AdminpageController, _super);
    function AdminpageController(waitcontrol) {
        _super.call(this);
        this.optionvalue = null;
        this.waitControl = waitcontrol;
        this.dataController = new AdminpageDataController(this);
    }
    AdminpageController.prototype.initializeAdminpage = function () {
        var _this = this;
        this.dataController.loadWebContext();
        this.dataController.setDocumentId(this.dataController.getWebContext().team.id);
        async.parallel([
            function (asyncCallback) {
                _this.dataController.loadVoting(asyncCallback);
            },
            function (asyncCallback) {
                _this.dataController.loadWITFieldNames(asyncCallback);
            }
        ], function (err) {
            if (err == null) {
                _this.actualVoting = _this.dataController.getSettings();
                _this.initializeLevelDropDown();
                _this.buildAdminpage();
                _this.waitControl.endWait();
            }
            else {
                switch (err.message) {
                    case "noVoting":
                        async.parallel([function (asyncCallback) {
                                _this.dataController.createNewVoting(asyncCallback);
                            },
                            function (asyncCallback) {
                                _this.dataController.loadWITFieldNames(asyncCallback);
                            }], function (err) {
                            if (err != null) {
                                LogExtension.log("Error:", err);
                            }
                        });
                        break;
                    case "noVotingActive":
                        _this.ActualVoting = new Voting();
                        break;
                }
                _this.actualVoting = _this.dataController.getSettings();
                _this.initializeLevelDropDown();
                _this.buildAdminpage();
                _this.waitControl.endWait();
            }
        });
    };
    AdminpageController.prototype.initializeLevelDropDown = function () {
        var fieldNames = this.dataController.getWITFieldNames();
        LogExtension.log("fieldNames:", fieldNames);
        if (fieldNames != undefined) {
            this.levels = fieldNames;
        }
    };
    AdminpageController.prototype.buildAdminpage = function () {
        if (this.levels != undefined) {
            this.levelCombo.setSource(this.levels);
        }
        LogExtension.log("set Voting level");
        if (this.actualVoting != undefined) {
            LogExtension.log("actual Voting found");
            if (this.actualVoting.IsVotingEnabled) {
                LogExtension.log("actual voting enabled");
                if ($("#content").hasClass("hide")) {
                    toggleActive();
                }
                this.setEditable(false);
                this.title.setText(this.actualVoting.Title);
                this.description.setText(this.actualVoting.Description);
                if (this.actualVoting.IsMultipleVotingEnabled) {
                    this.multipleVotesCombo.setText("Enabled");
                }
                else {
                    this.multipleVotesCombo.setText("Disabled");
                }
                this.levelCombo.setText(this.actualVoting.Level);
            }
            else {
                LogExtension.log("actual voting disabled");
                this.resetAdminpage();
                $('#errorMessage').toggleClass("hide", false);
            }
        }
        else {
            this.actualVoting = new Voting();
            this.title.setInvalid(true);
            $('#errorMessage').toggleClass("hide", false);
            $("#content").toggleClass("hide", true);
        }
        LogExtension.log("finished initializing");
        createMenueBar("false");
    };
    AdminpageController.prototype.removeRightAngleBrackets = function (s) {
        for (var i = 0; i < s.length; i++) {
            s = s.replace("<", "");
            s = s.replace(">", "");
        }
        return s;
    };
    AdminpageController.prototype.saveSettings = function (isEnabled) {
        var voting = "";
        var settings = this.actualVoting;
        settings.Title = this.removeRightAngleBrackets(settings.Title);
        if (settings.Title == undefined || settings.Title == "") {
            bsNotify("danger", "Please provide a title for the voting.");
            return;
        }
        settings.LastModified = Math.round((new Date()).getTime() / 1000);
        settings.Description = this.removeRightAngleBrackets(settings.Description);
        settings.Team = this.dataController.getWebContext().team.id;
        if (isEnabled == 'true') {
            settings.IsVotingEnabled = true;
        }
        else {
            settings.IsVotingEnabled = false;
            toggleActive();
        }
        LogExtension.log("Level:", settings.Level);
        if (settings.Level == undefined) {
            settings.Level = this.levelCombo.getText();
            LogExtension.log("New Level:", settings.Level);
        }
        voting = '{"created": "' + settings.Created.toString()
            + '", "lastModified": "' + settings.LastModified.toString()
            + '", "title": "' + settings.Title
            + '", "description": "' + settings.Description
            + '", "votingEnabled": "' + settings.IsVotingEnabled
            + '", "numberOfVotes": "' + settings.NumberOfVotes.toString()
            + '", "multipleVoting": "' + settings.IsMultipleVotingEnabled
            + '", "showResult": "' + settings.IsShowResultsEnabled
            + '", "group": "' + settings.Group
            + '", "team": "' + settings.Team
            + '", "level": "' + settings.Level + '"}';
        this.dataController.saveVoting(voting, settings.IsVotingEnabled);
        if (settings.IsVotingEnabled) {
            this.actualVoting = settings;
            this.buildAdminpage();
        }
        else {
            this.resetAdminpage();
            createMenueBar("false");
        }
    };
    AdminpageController.prototype.resetAdminpage = function () {
        LogExtension.log("reset the Adminpage");
        this.actualVoting = new Voting();
        this.title.setText("");
        this.title.setInvalid(true);
        this.description.setText("");
        this.setEditable(true);
        this.levelCombo.setText(this.levels[0]);
        LogExtension.log("finished resetting");
    };
    AdminpageController.prototype.abortVotingSettings = function () {
        this.resetAdminpage();
        this.buildAdminpage();
    };
    AdminpageController.prototype.setCombos = function (title, description, multipleVotes, level) {
        this.title = title;
        this.description = description;
        this.multipleVotesCombo = multipleVotes;
        this.levelCombo = level;
    };
    AdminpageController.prototype.setEditable = function (isEnabled) {
        this.multipleVotesCombo.setEnabled(isEnabled);
        this.levelCombo.setEnabled(isEnabled);
    };
    return AdminpageController;
})(BasicController);
var AdminpageMain = (function () {
    function AdminpageMain() {
    }
    AdminpageMain.startApplication = function (waitcontrol) {
        waitcontrol.startWait();
        var adminController = new AdminpageController(waitcontrol, new ReportView()); // Manual create it here ? I am not sure, this is generated...
        adminController.initializeAdminpage();
        AdminpageMain.setAdminController(adminController);
        generateCombos();
    };
    AdminpageMain.setMultipleVotes = function (isEnabled) {
        this.adminController.ActualVoting.IsMultipleVotingEnabled = isEnabled;
    };
    AdminpageMain.setLevel = function (level) {
        this.adminController.ActualVoting.Level = level;
    };
    AdminpageMain.setDescription = function (description) {
        this.adminController.ActualVoting.Description = description;
    };
    AdminpageMain.setTitle = function (title) {
        this.adminController.ActualVoting.Title = title;
    };
    AdminpageMain.setAdminController = function (value) {
        this.adminController = value;
        if (this.combos != undefined) {
            this.adminController.setCombos(this.combos[0], this.combos[1], this.combos[2], this.combos[3]);
        }
        this.userIsAdmin = VSS.getWebContext().team.userIsAdmin;
    };
    AdminpageMain.saveClicked = function (value) {
        this.adminController.saveSettings(value);
    };
    AdminpageMain.votingEnabledClicked = function () {
        toggleActive();
        if ($("#content").hasClass("hide") == false) {
            var voting = this.adminController.ActualVoting;
            voting.Created = Math.round((new Date()).getTime() / 1000);
            this.adminController.ActualVoting = voting;
            createMenueBar("true");
        }
    };
    AdminpageMain.cancelClicked = function () {
        $('#content').toggleClass("hide", true);
        this.adminController.ActualVoting = new Voting();
        this.adminController.buildAdminpage();
    };
    AdminpageMain.getMenuItems = function (isActive) {
        $('#menueBar-container').toggleClass("hide", false);
        $('#no-permissions').toggleClass("hide", true);
        $('#error-message').toggleClass("hide", true);
        if (this.adminController.ActualVoting == undefined ||
            this.adminController.ActualVoting == null ||
            !this.adminController.ActualVoting.IsVotingEnabled) {
            if (isActive == "true") {
                if (!this.userIsAdmin) {
                    $('#no-permissions').toggleClass("hide");
                }
                return [
                    { id: "createNewVoting", text: "Save Voting", title: "Save settings", icon: "icon icon-save", disabled: !this.userIsAdmin },
                    { id: "cancelVoting", title: "Cancel Voting", icon: "icon icon-delete", disabled: !this.userIsAdmin }
                ];
            }
            if (isActive == "false") {
                if (!this.userIsAdmin) {
                    $('#errorMessage').toggleClass("hide", false);
                }
                return [
                    { id: "createVoting", text: "Create new..", icon: "icon icon-add", disabled: !this.userIsAdmin }
                ];
            }
        }
        if (!this.userIsAdmin) {
            $('#no-permissions').toggleClass("hide");
        }
        return [
            { id: "saveSettings", text: "Save", title: "Save edited voting", icon: "icon icon-save", disabled: !this.userIsAdmin },
            { id: "terminateVoting", title: "Stop Voting", icon: "icon icon-delete", disabled: !this.userIsAdmin },
            { separator: true },
            { id: "infoButton", title: "Help", icon: "icon icon-info", disabled: false },
        ];
    };
    AdminpageMain.showInfo = function () {
        showInfoDialog();
    };
    AdminpageMain.setCombos = function (title, description, multipleVotes, level) {
        if (this.adminController != undefined) {
            this.adminController.setCombos(title, description, multipleVotes, level);
        }
        else {
            this.combos = [title, description, multipleVotes, level];
        }
    };
    return AdminpageMain;
})();
var LogExtension = (function () {
    function LogExtension() {
    }
    LogExtension.log = function (value, obj) {
        if (LogExtension.debugEnabled) {
            if (window.console) {
                console.log(value);
                if (obj != null) {
                    console.log(obj);
                }
            }
        }
    };
    LogExtension.debugEnabled = false;
    return LogExtension;
})();
var VotingpageDataController = (function (_super) {
    __extends(VotingpageDataController, _super);
    function VotingpageDataController(controller) {
        _super.call(this);
        this.votingController = controller;
    }
    VotingpageDataController.prototype.getVotes = function () {
        return this.votes;
    };
    VotingpageDataController.prototype.getRequirements = function () {
        return this.requirements;
    };
    VotingpageDataController.prototype.loadVotes = function (asyncCallback) {
        var _this = this;
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function (service) {
            service.getDocument(_this.webContext.collection.name, _this.documentId).then(function (doc) {
                var tempArray = new Array();
                if (JSON.stringify(doc.vote) != "[]") {
                    $.each(doc.vote, function (index, vote) {
                        var newVote = new Vote();
                        newVote.Id = parseInt(vote.id);
                        newVote.UserId = vote.userId;
                        newVote.VotingId = vote.votingId;
                        newVote.WorkItemId = vote.workItemId;
                        tempArray.push(newVote);
                    });
                }
                _this.votes = tempArray;
                asyncCallback();
            });
        });
    };
    VotingpageDataController.prototype.getAreas = function (asyncCallback) {
        var _this = this;
        VSS.require(["VSS/Service", "TFS/Work/RestClient"], function (VSS_Service, TFS_Work_WebApi) {
            LogExtension.log("in require");
            var client = TFS_Work_WebApi.getClient();
            LogExtension.log("got REST-Client");
            var tempAreas = "AND ( ";
            var teamcontext = {
                projectId: _this.webContext.project.id,
                teamId: _this.webContext.team.id
            };
            client.getTeamFieldValues(teamcontext).then(function (teamfieldvalues) {
                LogExtension.log(teamfieldvalues);
                $.each(teamfieldvalues.values, function (index, value) {
                    tempAreas += "[System.AreaPath] UNDER '";
                    tempAreas += value.value;
                    tempAreas += "'";
                    if (index < (teamfieldvalues.values.length - 1)) {
                        tempAreas += " OR ";
                    }
                    else {
                        tempAreas += " )";
                    }
                });
                LogExtension.log(tempAreas);
                _this.areas = tempAreas;
                LogExtension.log("finish area");
                asyncCallback();
            });
        });
    };
    VotingpageDataController.prototype.loadRequirements = function (asyncCallback) {
        var _this = this;
        this.requirements = new Array();
        VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"], function (VSS_Service, TFS_Wit_WebApi) {
            var witClient = VSS_Service.getCollectionClient(TFS_Wit_WebApi.WorkItemTrackingHttpClient);
            var wiql = "SELECT [System.Id] FROM WorkItems WHERE [System.State] <> 'Closed' AND [System.State] <> 'Done' AND [System.State] <> 'Removed'"
                + " AND [System.WorkItemType] = '" + _this.actualSetting.Level + "' " + _this.areas;
            var wiqlJson = {
                query: wiql
            };
            LogExtension.log("WIQL-Abfrage: " + wiql);
            witClient.queryByWiql(wiqlJson, _this.webContext.project.id).then(function (idJson) {
                LogExtension.log(idJson);
                var headArray = new Array();
                var tempArray = new Array();
                LogExtension.log(idJson.workItems);
                $.each(idJson.workItems, function (index, item) {
                    if ((index + 1) % 200 != 0) {
                        tempArray.push(item.id);
                    }
                    else {
                        headArray.push(tempArray);
                        tempArray = new Array();
                        tempArray.push(item.id);
                    }
                });
                headArray.push(tempArray);
                async.eachSeries(headArray, function (array, innerAsyncCallback) {
                    witClient.getWorkItems(array).then(function (result) {
                        $.each(result, function (index, req) {
                            LogExtension.log(req);
                            var tempRequirement = new TinyRequirement();
                            tempRequirement.Id = req.id;
                            if (req.fields['Microsoft.VSTS.Common.StackRank'] != undefined) {
                                tempRequirement.Order = req.fields['Microsoft.VSTS.Common.StackRank'];
                            }
                            else {
                                tempRequirement.Order = req.fields['Microsoft.VSTS.Common.BacklogPriority'];
                            }
                            tempRequirement.Title = req.fields['System.Title'];
                            tempRequirement.WorkItemType = req.fields['System.WorkItemType'];
                            tempRequirement.State = req.fields['System.State'];
                            tempRequirement.Size = req.fields['Microsoft.VSTS.Scheduling.Size'];
                            tempRequirement.ValueArea = req.fields['Microsoft.VSTS.Common.BusinessValue'];
                            tempRequirement.IterationPath = req.fields['System.IterationPath'];
                            tempRequirement.AssignedTo = req.fields['System.AssignedTo'];
                            tempRequirement.Description = req.fields['System.Description'];
                            _this.requirements.push(tempRequirement);
                        });
                        innerAsyncCallback();
                    }, function (error) {
                        LogExtension.log("Error at getWorkItems()");
                        LogExtension.log(error);
                        asyncCallback(new Error("nothingToVote"));
                    });
                }, function (err) {
                    if (err == null) {
                        asyncCallback();
                    }
                    else {
                        _this.votingController.nothingToVote(false);
                        asyncCallback(err);
                    }
                });
            }, function (error) {
                _this.votingController.nothingToVote(false);
                asyncCallback(error);
            });
        });
    };
    VotingpageDataController.prototype.saveVote = function (vote) {
        var _this = this;
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function (service) {
            service.getDocument(_this.webContext.collection.name, _this.documentId).then(function (doc) {
                var isEnabled;
                $.each(doc.voting, function (index, val) {
                    if (val.created == _this.actualSetting.Created) {
                        isEnabled = val.votingEnabled;
                    }
                });
                if (isEnabled == "true") {
                    var json = JSON.parse(vote);
                    var multipleVotes = false;
                    $.each(doc.vote, function (index, vote) {
                        if (vote.userId == json.userId && vote.votingId == json.votingId) {
                            if (vote.workItemId == json.workItemId) {
                                multipleVotes = true;
                            }
                        }
                    });
                    if ((_this.actualSetting.NumberOfVotes - _this.votingController.numberOfMyVotes()) < 1) {
                        bsNotify("warning", "You have no vote remaining. \nPlease refresh your browser window to get the actual content.");
                        return;
                    }
                    else {
                        if (doc.voting.multipleVoting == "false" && multipleVotes) {
                            bsNotify("warning", "You cannot vote again for this Item. Please refresh your browser window to get the actual content.");
                            return;
                        }
                        else {
                            doc.vote.push(json);
                            service.updateDocument(_this.webContext.collection.name, doc).then(function (uDoc) {
                                LogExtension.log("saveVote: document updated", uDoc.id);
                                bsNotify("success", "Your vote has been saved.");
                                _this.votingController.initializeVotingpage();
                            });
                        }
                    }
                }
                else {
                    bsNotify("warning", "This voting has been stopped. \nPlease refresh your browser windot to get the actual content.");
                }
            }, function (error) {
                LogExtension.log(error);
            });
        });
    };
    VotingpageDataController.prototype.deleteVote = function (id, userId) {
        var _this = this;
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function (service) {
            service.getDocument(_this.webContext.collection.name, _this.documentId).then(function (doc) {
                var isEnabled;
                $.each(doc.voting, function (index, val) {
                    if (val.created == _this.actualSetting.Created) {
                        isEnabled = val.votingEnabled;
                    }
                });
                if (isEnabled == "true") {
                    LogExtension.log("Item Id", id);
                    $.each(doc.vote, function (index, item) {
                        if (item.workItemId == id) {
                            LogExtension.log(item.workItemId, id);
                            if (item.userId == userId) {
                                doc.vote.splice(index, 1);
                                return false;
                            }
                        }
                    });
                    service.updateDocument(_this.webContext.collection.name, doc).then(function (uDoc) {
                        LogExtension.log("deleteVote: document updated", uDoc.id);
                        bsNotify("success", "Your vote has been deleted.");
                        _this.votingController.initializeVotingpage();
                    });
                }
                else {
                    bsNotify("warning", "This voting has been stopped. \nPlease refresh your browser windot to get the actual content.");
                }
            });
        });
    };
    VotingpageDataController.prototype.updateBacklog = function (wis, firstBacklogItem) {
        LogExtension.log("begin updating");
        var order;
        var template = this.getTemplate();
        switch (template) {
            case "CMMI":
                order = "Microsoft.VSTS.Common.StackRank";
                break;
            case "Agile":
                order = "Microsoft.VSTS.Common.StackRank";
                break;
            case "Scrum":
                order = "Microsoft.VSTS.Common.BacklogPriority";
                break;
            default:
                order = "";
                break;
        }
        var success = true;
        $.each(wis, function (idx, item) {
            var newOrder = (parseInt(firstBacklogItem.Order) - (idx + 1));
            var path = "/fields/" + order;
            var newJson = [
                {
                    "op": "replace",
                    "path": path,
                    "value": newOrder
                }
            ];
            async.series([
                function (callback) {
                    VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"], function (VSS_Service, TFS_Wit_WebApi) {
                        var witClient = TFS_Wit_WebApi.getClient();
                        witClient.updateWorkItem(newJson, item.Id).then(function (result) {
                            LogExtension.log("replace success: " + item.Id);
                            callback();
                        }, function (error) {
                            LogExtension.log("replace failed: " + item.Id + ", trying to add...");
                            var addJson = [
                                {
                                    "op": "add",
                                    "path": path,
                                    "value": newOrder
                                }
                            ];
                            witClient.updateWorkItem(addJson, item.Id).then(function (result) {
                                LogExtension.log("add success: " + item.Id);
                                callback();
                            }, function (error) {
                                LogExtension.log(error);
                                callback(error);
                            });
                        });
                    });
                }
            ], function (err) {
                if (err != null) {
                    success = false;
                }
            });
        });
        if (success) {
            bsNotify("success", "Your Backlog has been successfully updated.");
        }
        else {
            bsNotify("danger", "An error occured.\nPlease refresh the page and try again");
        }
    };
    VotingpageDataController.prototype.applyToBacklog = function () {
        var _this = this;
        this.loadWebContext();
        async.series([
            function (asyncCallback) {
                _this.loadWITFieldNames(asyncCallback);
            },
            function (asyncCallback) {
                _this.loadVoting(asyncCallback);
            },
            function (asyncCallback) {
                _this.loadVotes(asyncCallback);
            },
            function (asyncCallback) {
                _this.getAreas(asyncCallback);
            },
            function (asyncCallback) {
                _this.loadRequirements(asyncCallback);
            }], function (err) {
            if (err == null) {
                _this.votingController.calculating();
                _this.votingController.calculateMyVotes();
                var votingItems = _this.votingController.getActualVotingItems();
                LogExtension.log("VotingItems: ", votingItems);
                votingItems.sort(function (a, b) {
                    return parseInt(a.Order) - parseInt(b.Order);
                });
                var tempItem = votingItems[0];
                votingItems.sort(function (a, b) {
                    return a.AllVotes - b.AllVotes;
                });
                $.each(votingItems, function (idx, item) {
                    if (item.AllVotes > 0) {
                        votingItems.splice(0, idx);
                        return false;
                    }
                });
                _this.updateBacklog(votingItems, tempItem);
            }
            else {
                bsNotify("danger", "An error occured.\nPlease refresh the page and try again");
            }
        });
    };
    return VotingpageDataController;
})(BasicDataController);
var VotingpageController = (function (_super) {
    __extends(VotingpageController, _super);
    function VotingpageController(waitControl) {
        this.waitControl = waitControl;
        _super.call(this);
        this.dataController = new VotingpageDataController(this);
    }
    VotingpageController.prototype.getActualVotingItems = function () {
        return this.actualVotingItems;
    };
    VotingpageController.prototype.initializeVotingpage = function () {
        var _this = this;
        this.dataController.loadWebContext();
        this.setAttributes(this.dataController.getWebContext());
        this.dataController.setDocumentId(this.dataController.getWebContext().team.id);
        async.series([
            function (asyncCallback) {
                LogExtension.log("loadVoting");
                _this.dataController.loadVoting(asyncCallback);
            },
            function (asyncCallback) {
                LogExtension.log("loadVotes");
                _this.dataController.loadVotes(asyncCallback);
            },
            function (asyncCallback) {
                LogExtension.log("getAreas");
                _this.dataController.getAreas(asyncCallback);
            },
            function (asyncCallback) {
                LogExtension.log("loadRequirements");
                _this.dataController.loadRequirements(asyncCallback);
            }
        ], function (err) {
            if (err == null) {
                _this.actualVoting = _this.dataController.getSettings();
                _this.calculating();
                _this.buildVotingTable();
                _this.nothingToVote(true);
            }
            else {
                LogExtension.log("Error occured: " + err);
                switch (err.message) {
                    case "noVotingActive":
                        _this.votingInactive();
                        break;
                    case "noVoting":
                        _this.votingInactive();
                        break;
                    case "nothingToVote":
                        _this.nothingToVote(false);
                        break;
                }
            }
        });
    };
    VotingpageController.prototype.calculating = function () {
        var _this = this;
        this.remainingVotes = this.actualVoting.NumberOfVotes;
        this.myVotes = new Array();
        this.allVotes = new Array();
        if (this.dataController.getVotes() != undefined) {
            $.each(this.dataController.getVotes(), function (index, item) {
                if (parseInt(item.VotingId) == _this.actualVoting.Created) {
                    _this.allVotes.push(item);
                }
            });
        }
    };
    VotingpageController.prototype.calculateMyVotes = function () {
        var _this = this;
        this.actualVotingItems = new Array();
        $.each(this.dataController.getRequirements(), function (index, reqItem) {
            var votingItemTemp = new VotingItem();
            votingItemTemp.Id = reqItem.Id;
            votingItemTemp.Order = reqItem.Order;
            votingItemTemp.Title = reqItem.Title;
            votingItemTemp.WorkItemType = reqItem.WorkItemType;
            votingItemTemp.ValueArea = reqItem.ValueArea;
            votingItemTemp.RequirementType = reqItem.RequirementType;
            votingItemTemp.State = reqItem.State;
            votingItemTemp.Size = reqItem.Size;
            votingItemTemp.IterationPath = reqItem.IterationPath;
            votingItemTemp.AssignedTo = reqItem.AssignedTo;
            votingItemTemp.MyVotes = 0;
            votingItemTemp.AllVotes = 0;
            if (_this.allVotes != undefined) {
                $.each(_this.allVotes, function (i, vote) {
                    if (vote.WorkItemId == reqItem.Id) {
                        votingItemTemp.AllVotes++;
                        if (vote.UserId == _this.user.Id) {
                            _this.myVotes.push(vote);
                            _this.remainingVotes--;
                            votingItemTemp.MyVotes++;
                        }
                    }
                });
            }
            LogExtension.log(votingItemTemp);
            _this.actualVotingItems.push(votingItemTemp);
        });
        LogExtension.log("finished calculating MyVotes");
        return;
    };
    VotingpageController.prototype.displayRemainingVotes = function () {
        switch (this.remainingVotes) {
            case 0:
                $("#remainingVotesDiv").html("<p>You have no votes left</p>");
                break;
            case 1:
                $("#remainingVotesDiv").html("<p>You have 1 vote left</p>");
                break;
            default:
                $("#remainingVotesDiv").html("<p>You have " + this.remainingVotes + " votes left</p>");
                break;
        }
    };
    VotingpageController.prototype.buildVotingTable = function () {
        this.actualVotingItems = new Array();
        this.calculateMyVotes();
        this.displayRemainingVotes();
        LogExtension.log("set Data");
        this.grid.setDataSource(this.actualVotingItems);
        this.lockButtons = false;
        LogExtension.log("Data online");
        if (this.user.IsAdmin) {
            createVotingMenue();
        }
    };
    VotingpageController.prototype.setGrid = function (grid) {
        this.grid = grid;
        this.lockButtons = false;
    };
    VotingpageController.prototype.setVotingSettings = function () {
        if (this.actualVoting == undefined) {
            this.actualVoting = new Voting();
        }
        if (this.actualVoting.Title != undefined) {
            $("#titleDiv").html("<p>" + this.actualVoting.Title + "</p>");
        }
        if (this.actualVoting.Description != undefined) {
            $("#informationDiv").html("<p>" + this.actualVoting.Description + "</p>");
        }
    };
    VotingpageController.prototype.votingInactive = function () {
        $("#contentVotingActive").toggleClass("hide");
        $("#contentVotingInactive").toggleClass("hide");
        this.waitControl.endWait();
    };
    VotingpageController.prototype.saveVoting = function (id, upVote) {
        var _this = this;
        if (upVote) {
            $.each(this.actualVotingItems, function (index, item) {
                if (item.Id == id) {
                    var newId = 0;
                    if (_this.allVotes != undefined) {
                        newId = _this.allVotes.length;
                    }
                    var vote = '{"id": "' + newId.toString()
                        + '","userId": "' + _this.user.Id
                        + '","votingId": "' + _this.actualVoting.Created
                        + '","workItemId": "' + id
                        + '"}';
                    _this.dataController.saveVote(vote);
                }
            });
        }
        else {
            this.dataController.deleteVote(id, this.user.Id);
        }
    };
    Object.defineProperty(VotingpageController.prototype, "RemainingVotes", {
        get: function () {
            return this.remainingVotes;
        },
        enumerable: true,
        configurable: true
    });
    VotingpageController.prototype.numberOfMyVotes = function () {
        return this.myVotes.length;
    };
    VotingpageController.prototype.actualVotingItem = function (id) {
        var votingItem;
        $.each(this.actualVotingItems, function (index, item) {
            if (item.Id == id) {
                votingItem = item;
            }
        });
        return votingItem;
    };
    VotingpageController.prototype.nothingToVote = function (isThereAnythingToVote) {
        this.setVotingSettings();
        if (isThereAnythingToVote) {
            $('#grid-container').toggleClass("hide", false);
        }
        else {
            $('#nothingToVote').toggleClass("hide", false);
        }
        this.waitControl.endWait();
    };
    VotingpageController.prototype.applyToBacklog = function () {
        this.dataController.applyToBacklog();
    };
    Object.defineProperty(VotingpageController.prototype, "LockButtons", {
        get: function () {
            return this.lockButtons;
        },
        set: function (value) {
            this.lockButtons = value;
        },
        enumerable: true,
        configurable: true
    });
    return VotingpageController;
})(BasicController);
var VotingpageMain = (function () {
    function VotingpageMain() {
    }
    VotingpageMain.startApplication = function (waitcontrol) {
        VotingpageMain.context = VSS.getWebContext();
        VotingpageMain.extensioncontext = VSS.getExtensionContext();
        waitcontrol.startWait();
        var votingController = new VotingpageController(waitcontrol);
        VotingpageMain.setVotingController(votingController);
        votingController.initializeVotingpage();
        VotingpageMain.createAdminpageUri();
        createVotingTable();
    };
    VotingpageMain.getAdminpageUri = function () {
        return VotingpageMain.adminpageUri;
    };
    VotingpageMain.setVotingController = function (value) {
        this.votingController = value;
        if (VotingpageMain.grid != undefined) {
            this.votingController.setGrid(VotingpageMain.grid);
        }
    };
    VotingpageMain.applyClicked = function () {
        this.votingController.applyToBacklog();
    };
    VotingpageMain.createAdminpageUri = function () {
        var x = VSS.getWebContext();
        var context = VSS.getExtensionContext();
        var host = x.host.uri;
        var project = x.project.name;
        var team = x.team.name;
        var publisher = context.publisherId;
        var extensionId = context.extensionId;
        project = project.replace("(", "%28");
        project = project.replace(")", "%29");
        team = team.replace("(", "%28");
        team = team.replace(")", "%29");
        var uri = host + project + "/" + team + "/_admin/_apps/hub/" + publisher + "." + extensionId + ".Voting.Administration";
        VotingpageMain.adminpageUri = uri;
        $('#linkToAdminpage').prop("href", uri);
    };
    VotingpageMain.voteUpClicked = function (element) {
        if (!this.votingController.LockButtons) {
            this.votingController.LockButtons = true;
            appInsights.trackEvent("Vote up", { ExtensionId: VotingpageMain.extensioncontext.extensionId, Account: VotingpageMain.context.account.name, TeamProject: VotingpageMain.context.project.id });
            var voteId = $(element).parents('.grid-row').find('div:nth-child(3)').text();
            this.votingController.saveVoting(voteId, true);
        }
    };
    VotingpageMain.voteDownClicked = function (element) {
        if (!this.votingController.LockButtons) {
            this.votingController.LockButtons = true;
            appInsights.trackEvent("Vote down", { ExtensionId: VotingpageMain.extensioncontext.extensionId, Account: VotingpageMain.context.account.name, TeamProject: VotingpageMain.context.project.id });
            var voteId = $(element).parents('.grid-row').find('div:nth-child(3)').text();
            this.votingController.saveVoting(voteId, false);
        }
    };
    VotingpageMain.initializeItem = function (id, voteUp, voteDown) {
        var votingItem = this.votingController.actualVotingItem(id);
        $(voteUp).parent().toggleClass("hide", true);
        $(voteDown).parent().toggleClass("hide", true);
        if (this.votingController.RemainingVotes > 0) {
            if (votingItem.MyVotes == 0 || this.votingController.ActualVoting.IsMultipleVotingEnabled) {
                $(voteUp).parent().toggleClass("hide");
            }
        }
        if (votingItem.MyVotes > 0) {
            $(voteDown).parent().toggleClass("hide");
        }
    };
    VotingpageMain.setGrid = function (grid) {
        if (this.votingController != undefined) {
            this.votingController.setGrid(grid);
        }
        else {
            VotingpageMain.grid = grid;
        }
    };
    VotingpageMain.refresh = function () {
        window.location.href = window.location.href;
    };
    VotingpageMain.refreshTable = function () {
        VotingpageMain.votingController.initializeVotingpage();
    };
    return VotingpageMain;
})();
//# sourceMappingURL=tsBundle.js.map