$(document).ready(function () {
    LogExtension.debugEnabled = false;
    try {
        VSS.init({
            //explicitNotifyLoaded: true,
            usePlatformStyles: true,
            usePlatformScripts: true
        });
        VSS.ready(function () {
            LogExtension.log("VSS ready");
            VSS.require(["VSS/Controls", "VSS/Controls/StatusIndicator"], function (Controls, StatusIndicator) {
                var waitcontrol = Controls.create(StatusIndicator.WaitControl, $('#waitContainer'), {
                    message: "Loading..."
                });
                LogExtension.log("Waitcontrol ready", "start application");
                AdminpageMain.startApplication(waitcontrol);
                LogExtension.log("Events ready");
                $('#appVersion').text(VSS.getExtensionContext().version);
            });
        });

        
    } catch (ex) {
        LogExtension.log(ex);
    }

    $(document).bind("ajaxSend", function () {
        $("#progressBar").show();
    }).bind("ajaxComplete", function () {
        $("#progressBar").hide();
    });
});

function showInfoDialog() {
    VSS.require(("VSS/Controls/Dialogs"), function (Dialogs) {
        Dialogs.show(Dialogs.ModalDialog, {
            title: "Help",
            contentText: "During a running voting you can edit 'Title' and 'Description' of the voting.\nTo change another property you have to stop the actual voting and create a new one",
            buttons: []
        });
    });
}
function generateCombos() {
    VSS.require(["VSS/Controls", "VSS/Controls/Combos"], function (Controls, Combos) {
        var titleField = Controls.create(Combos.Combo, $('#titleContainer'), {  
            type: "list",
            label: "Provide a title for the voting (required)",
            mode: "text",
            enabled: true,
            value: "",
            invalidCss: "invalid",
            change: function () {
                if (this.getText() == "") {
                    this.setInvalid(true);
                } else {
                    this.setInvalid(false);
                    AdminpageMain.setTitle(this.getText());
                }
            }
        });

        var descriptionField = Controls.create(Combos.Combo, $('#descriptionContainer'), {
            type: "list",
            label: "Provide a description for the voting (optional)",
            mode: "text",
            value: "",
            enabled: true,
            change: function() {
                AdminpageMain.setDescription(this.getText());
            }
        });

        var multipleVotesCombo = Controls.create(Combos.Combo, $('#multipleVotesContainer'), {
            type: "list",
            mode: "drop",
            source: [
                "Disabled", "Enabled"
            ],
            value: "Disabled",
            allowEdit: false,
            enabled: true,
            indexChanged: function () {
                var isEnabled = this.getText() == "Enabled";
                AdminpageMain.setMultipleVotes(isEnabled);
            },
            disabledCss: "readOnly"
        });

        var levelCombo = Controls.create(Combos.Combo, $('#levelContainer'), {
            type: "list",
            mode: "drop",
            //value: "Bug",
            allowEdit: false,
            enabled: true,
            change: function () {
                AdminpageMain.setLevel(this.getText());
            },
            disabledCss: "readOnly"
        });
        AdminpageMain.setCombos(titleField, descriptionField, multipleVotesCombo, levelCombo);
    });
}

function toggleActive() {
    $('#content').toggleClass("hide");
}

function appendAppVersion() {
    $('#appVersion').text(VSS.getExtensionContext().version);
}

function addToIncludes(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    $("#includeListbody").append(document.getElementById(data));
    AdminpageMain.addToIncludeList($("#" + data).children(".panel-body").text());
    //ev.target.appendChild();
}

function addToExcludes(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");  
    $("#excludeListbody").append(document.getElementById(data));
    AdminpageMain.addToExcludeList($("#" + data).children(".panel-body").text());
    //ev.target.appendChild();
}

function startDrag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function onDragOver(ev) {
    ev.preventDefault();
}

function createMenueBar(isActive) {
    $("#menueBar-container").empty();
    VSS.require(["VSS/Controls", "VSS/Controls/Menus"], function (Controls, Menus) {
        // Create the menubar in a container element
        var menubar = Controls.create(Menus.MenuBar, $("#menueBar-container"), {
            showIcon: true,
            items: AdminpageMain.getMenuItems(isActive),
            executeAction: function (args) {
                var command = args.get_commandName();
                switch (command) {
                    case "createVoting":
                        AdminpageMain.votingEnabledClicked();
                        $('#errorMessage').toggleClass("hide", true);
                        break;
                    case "createNewVoting":
                        var webcontext = VSS.getWebContext();
                        var extensioncontext = VSS.getExtensionContext();
                        appInsights.trackEvent("Create voting", { ExtensionId: extensioncontext.extensionId, Account: webcontext.account.name, TeamProject: webcontext.project.id });
                    case "saveSettings":
                        AdminpageMain.saveClicked("true");
                        break;
                    case "infoButton":
                        AdminpageMain.showInfo();
                        break;
                    case "cancelVoting":
                        AdminpageMain.cancelClicked();
                        break;
                    case "terminateVoting":
                        AdminpageMain.saveClicked("false");
                        break;
                    case "excludeList":
                        AdminpageMain.loadExcludeList();
                        $('#excludeModal').modal();
                        break;
                    case "applyToBacklog":
                        AdminpageMain.applyClicked();
                        break;
                }
            }
        });
    });
}