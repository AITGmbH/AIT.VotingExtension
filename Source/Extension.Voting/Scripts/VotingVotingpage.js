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
                VotingpageMain.startApplication(waitcontrol);
            });
        });
    } catch(ex) {
        LogExtension.log(ex);
    }
    
    $(document).bind("ajaxSend", function () {
        $("#progressBar").show();
    }).bind("ajaxComplete", function () {
        $("#progressBar").hide();
    });
});

function createVotingTable() {
    VSS.require(["VSS/Controls", "VSS/Controls/Grids"], function (Controls, Grids) {
        var grid = Controls.create(Grids.Grid, $("#grid-container"), {
            height: "400px",
            allowMultiSelect: false,
            columns: [
                {
                    title: "Vote up", id: "voteUp", canSortBy: false, width: 20, getCellContents: function () {
                        var upVoteControl = '<div class="grid-cell grid-buttonVoteUp-holder" role="gridcell" style="width: 20px;">';
                        upVoteControl += '<span class="upvote-holder">';
                        upVoteControl += '<span class="icon icon-add voting-plus hide" aria-hidden="true" onClick="VotingpageMain.voteUpClicked(this)"></span>';
                        upVoteControl += '</span></div>';

                        return $(upVoteControl);
                    }
                }, {
                    title: "Vote down", id: "voteDown", canSortBy: false, width: 20, getCellContents: function () {
                        var downVoteControl = '<div class="grid-cell grid-buttonVoteDown-holder" role="gridcell" style="width: 20px;">';
                        downVoteControl += '<span class="downvote-holder">';
                        downVoteControl += '<span class="icon icon-delete voting-remove hide" aria-hidden="true" onClick="VotingpageMain.voteDownClicked(this)"></span>';
                        downVoteControl += '</span></div>';

                        return $(downVoteControl);
                    }
                },
                { title: "Work Item ID", text: "ID", index: "id", width: 50, id: "itemId" },
                { title: "Work Item Type", text: "Work Item Type", index: "workItemType", width: 100 },
                { title: "Work Item Title", text: "Title", index: "title", width: 200 },
                { title: "Assigned team member", text: "Assigned To", index: "assignedTo", width: 125 },
                { title: "Work Item State", text: "State", index: "state", width: 100 },
                { title: "All votes per item", text: "Votes", index: "allVotes", width: 60 },
                { title: "My Votes per item", text: "My Votes", index: "myVotes", width: 60 },
                { text: "Order", index: "order", width: 50, hidden: true }
            ],
            openRowDetail: function (index) {
                var item = grid.getRowData(index);
                VSS.require(["TFS/WorkItemTracking/Services"], function (wiServices) {
                    wiServices.WorkItemFormNavigationService.getService().then(function (service) {
                        service.openWorkItem(item.Id);
                    });
                });
            },
            sortOrder: [{
                index: "allVotes",
                order: "desc"
            },
            //{
            //    index: "myVotes",
            //    order: "desc"
            //},
                {
                    index: "order",
                    order: "asc"
                }],
            autoSort: true
        });
        VotingpageMain.setGrid(grid);
        insertionQ('.grid-row').every(function (element) {
            var cellAddButton = $(element).find('div:nth-child(1)');
            var cellRemoveButton = $(element).find('div:nth-child(2)');
            var cellId = $(element).find('div:nth-child(3)');
            var cellWorkItemType = $(element).find('div:nth-child(4)');
            var cellTitle = $(element).find('div:nth-child(5)');
            var cellAssignedTo = $(element).find('div:nth-child(6)');

            var title = $(cellTitle).text();
            var cssClass = $(cellWorkItemType).text().toLowerCase().replace(/\s+/g, '');
            var assignedTo = parseEmail($(cellAssignedTo).text());

            $(cellTitle).text('');
            $(cellTitle).append('<div class="work-item-color ' + cssClass + '-color">&nbsp;</div>');
            $(cellTitle).append('<span>' + title + '</span>');
            $(cellAssignedTo).text(assignedTo);

            var voteUpButton = $(cellAddButton).find('span > span.icon');
            var voteDownButton = $(cellRemoveButton).find('span > span.icon');
            VotingpageMain.initializeItem($(cellId).text(), voteUpButton, voteDownButton);
        });
    });
}

function parseEmail(inputText) {
    var regexMail = /(.+?)\s<[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}>/i;
    var matchMail = regexMail.exec(inputText);
    if (matchMail != null) {
        return matchMail[1];
    }
    return inputText;
}
function createVotingMenue() {
    VSS.require(["VSS/Controls", "VSS/Controls/Menus"], function (Controls, Menus) {
        // Create the menubar in a container element
        var menubar = Controls.create(Menus.MenuBar, $("#votingMenue-container"), {
            showIcon: true,
            items: [
                {
                    id: "refresh", title: "Refresh voting table",
                    icon: "icon icon-refresh", disabled: false
                },
                {
                    id: "applyToBacklog", title: "Apply to Backlog",
                    icon: "icon icon-tfs-query-edit", disabled: false
                },
                {
                    separator: true
                },
                {
                    id: "adminpageLink", title: "Visit settings page",
                    icon: "icon icon-settings", disabled: false
                },
                {
                    separator: true
                },
                {
                    id: "removeAllUserdata", title: "Deletes all user-voring realated data from storage.",
                    icon: "icon icon-delete", disabled: false
                }
            ],
            executeAction: function (args) {
                var command = args.get_commandName();
                switch (command) {
                    case "applyToBacklog":
                        VotingpageMain.applyClicked();
                        break;
                    case "adminpageLink":
                        var url = VotingpageMain.getAdminpageUri();
                        window.open(url, '_blank');
                        break;
                    case "refresh":
                        VotingpageMain.refreshTable();
                        break;
                    case "removeAllUserdata":
                        VotingpageMain.removeAllUserdata();
                        break;
                }
            }
        });
        $('#votingMenue-container').toggleClass("hide", false);
    });
}