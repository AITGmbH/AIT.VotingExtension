/// <reference types="jquery" />
/// <reference types="vss-web-extension-sdk" />
///<reference path="../Entities/Voting.ts"/>
///<reference path="../Entities/TinyRequirement.ts"/>
///<reference path="../Entities/VotingItem.ts"/>
///<reference path="../Entities/Vote.ts"/>
///<reference path="BasicDataController.ts"/>
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
/// Controller Class with Api-functions
///</summary>
var AdminpageDataController = /** @class */ (function (_super) {
    __extends(AdminpageDataController, _super);
    function AdminpageDataController(controller) {
        var _this = _super.call(this) || this;
        _this.controller = controller;
        return _this;
    }
    AdminpageDataController.prototype.addToExclude = function (item) {
        var _this = this;
        if (this.excludes.indexOf(item) == -1) {
            this.excludes.push(item);
            this.witFieldNames.splice(this.witFieldNames.indexOf(item), 1);
        }
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function (service) {
            service.getDocument(_this.webContext.collection.name, _this.documentId).then(function (doc) {
                doc.excludes = _this.excludes;
                service.updateDocument(_this.webContext.collection.name, doc).then(function (uDoc) {
                    LogExtension.log("saveVoting: document updated", uDoc.id);
                });
            });
        });
    };
    AdminpageDataController.prototype.changeProcess = function (process) {
        var _this = this;
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function (service) {
            service.getDocument(_this.webContext.collection.name, _this.documentId).then(function (doc) {
                doc.process = process;
                service.updateDocument(_this.webContext.collection.name, doc).then(function (uDoc) {
                    LogExtension.log("saveVoting: document updated", uDoc.id);
                });
            });
        });
    };
    AdminpageDataController.prototype.addToInclude = function (item) {
        var _this = this;
        if (this.witFieldNames.indexOf(item) == -1) {
            this.witFieldNames.push(item);
            this.excludes.splice(this.excludes.indexOf(item), 1);
        }
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function (service) {
            service.getDocument(_this.webContext.collection.name, _this.documentId).then(function (doc) {
                doc.excludes = _this.excludes;
                service.updateDocument(_this.webContext.collection.name, doc).then(function (uDoc) {
                    LogExtension.log("saveVoting: document updated", uDoc.id);
                });
            });
        });
    };
    AdminpageDataController.prototype.createNewVoting = function (asyncCallback) {
        var _this = this;
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function (service) {
            var newDoc = {
                id: _this.documentId,
                voting: [],
                vote: [],
                excludes: [],
                process: _this.process,
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
    //Method to store the given string with Votingsettings into the Settings-Document
    AdminpageDataController.prototype.saveVoting = function (settings, onoff) {
        var _this = this;
        //setDocument with VSO-Api
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function (service) {
            service.getDocument(_this.webContext.collection.name, _this.documentId).then(function (doc) {
                doc.voting.push(JSON.parse(settings));
                doc.excludes = _this.excludes;
                doc.process = _this.process;
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
                        excludes: [],
                        process: _this.process,
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
}(BasicDataController));
