/// <reference types="jquery" />
/// <reference types="vss-web-extension-sdk" />
///<reference path="../Entities/Voting.ts"/>
///<reference path="../Entities/TinyRequirement.ts"/>
///<reference path="../Entities/VotingItem.ts"/>
///<reference path="../Entities/Vote.ts"/>
///<reference path="BasicDataController.ts"/>


declare function bsNotify(type, message);

///<summary>
/// Controller Class with Api-functions
///</summary>
class AdminpageDataController extends BasicDataController {
    private controller: AdminpageController;

    constructor(controller: AdminpageController) {
        super();
        this.controller = controller;
    }

    public addToExclude(item: string) {
        if (this.excludes.indexOf(item) == -1) {
            this.excludes.push(item);
            this.witFieldNames.splice(this.witFieldNames.indexOf(item), 1);
        }
        VSS.getService(VSS.ServiceIds.ExtensionData).then((service: IExtensionDataService) => {
            service.getDocument(this.webContext.collection.name, this.documentId).then((doc) => {
                doc.excludes = this.excludes;
                service.updateDocument(this.webContext.collection.name, doc).then((uDoc) => {
                    LogExtension.log("saveVoting: document updated", uDoc.id);
                });
            });
        });
    }

    public changeProcess(process:string) {
        VSS.getService(VSS.ServiceIds.ExtensionData).then((service: IExtensionDataService) => {
            service.getDocument(this.webContext.collection.name, this.documentId).then((doc) => {
                doc.process = process;
                service.updateDocument(this.webContext.collection.name, doc).then((uDoc) => {
                    LogExtension.log("saveVoting: document updated", uDoc.id);
                });
            });
        });
    }

    public addToInclude(item: string) {
        if (this.witFieldNames.indexOf(item) == -1) {
            this.witFieldNames.push(item);
            this.excludes.splice(this.excludes.indexOf(item), 1);
        }
        VSS.getService(VSS.ServiceIds.ExtensionData).then((service: IExtensionDataService) => {
            service.getDocument(this.webContext.collection.name, this.documentId).then((doc) => {
                doc.excludes = this.excludes;
                service.updateDocument(this.webContext.collection.name, doc).then((uDoc) => {
                    LogExtension.log("saveVoting: document updated", uDoc.id);
                });
            });
        });
    }
    
    public createNewVoting(asyncCallback) {
        VSS.getService(VSS.ServiceIds.ExtensionData).then((service: IExtensionDataService) => {
            var newDoc = {
                id: this.documentId,
                voting: [],
                vote: [],
                excludes: [],
                process: this.process,
                _etag: -1
            };
            service.createDocument(this.webContext.collection.name, newDoc).then((cDoc) => {
                LogExtension.log("Doc id: " + cDoc.id);
                this.actualSetting = new Voting();
                return asyncCallback();
            }, (error) => {
                LogExtension.log(error);
                return asyncCallback(new Error("cannot create Document"));
            });
        });
    }

    //Method to store the given string with Votingsettings into the Settings-Document
    public saveVoting(settings: string, onoff: boolean) {
        //setDocument with VSO-Api
        VSS.getService(VSS.ServiceIds.ExtensionData).then((service: IExtensionDataService) => {
            service.getDocument(this.webContext.collection.name, this.documentId).then((doc) => {
                doc.voting.push(JSON.parse(settings));
                doc.excludes = this.excludes;
                doc.process = this.process;
                service.updateDocument(this.webContext.collection.name, doc).then((uDoc) => {
                    LogExtension.log("saveVoting: document updated", uDoc.id);
                    if (onoff) {
                        bsNotify("success", "Your settings has been saved");
                    } else {
                        bsNotify("success", "Your voting has been stopped");
                    }
                }, (error) => {
                    LogExtension.log("Error occured: ", error);
                    var newDoc = {
                        id: this.documentId,
                        voting: [],
                        vote: [],
                        excludes: [],
                        process: this.process,
                        _etag: -1
                    };
                    service.createDocument(this.webContext.collection.name, newDoc).then((cDoc) => {
                        LogExtension.log("Doc id: " + cDoc.id);
                        cDoc.voting.push(JSON.parse(settings));
                        service.updateDocument(this.webContext.collection.name, doc).then((uDoc) => {
                            LogExtension.log("saveVoting: document updated", uDoc.id);
                            if (onoff) {
                                bsNotify("success", "Your settings has been saved");
                            } else {
                                bsNotify("success", "Your voting has been stopped");
                            }
                        });
                    }, (err) => {
                        LogExtension.log(err);
                        bsNotify("danger", "Something went wrong. Try to reload page and do it again");
                    });
                });
            }, (error) => {
                LogExtension.log("Save settings, loading document", error);
                bsNotify("danger", "Internal connection problems occured, so your settings couldn't be saved.\nPlease refresh the page and try it again");
            });
        });
    }
}