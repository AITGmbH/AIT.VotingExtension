# AIT Voting Extension

Democratize your backlog with Voting Extension. Ask your stakeholders to vote for their favorite backlog items. Align your work on your stakeholders' needs.

Click the picture below to see a demo video.
[!["Demo video"](https://asap-voting-preview.azurewebsites.net/Video/VotingExtensionDemo_First_Frame.png)](https://youtu.be/GvzbQba2cGU)

## Requirements

-   The extension can only be used with TFS 2015 Update 3 and higher if SSL communication is enabled
-   Only unfinished Work Items can be voted

## Quick Steps

1. Create a new voting
2. Specify the title and the description of the voting
3. Decide whether multiple voting per item is allowed
4. Decides which work item type should be displayed
5. Click on save to start the voting
6. Each team member votes for the items it want to see on the top of the backlog
7. Apply the (interim) results to the backlog

## How to build

Run the following commands from within the Source\Extension.Voting folder.

```shell

# Restore node-modules
npm install

# Set tfx_publisher to your publisher name as environment variable
$env:tfx_publisher = "YourPublisherName"

# Set tfx_extension_id to your extension id as environment variable
$env:tfx_extension_id = "YourExtensionId"

# Create new extension version
#   - run the following command from within the folder ~\Source\Extension.Voting
#   - enter your Personal Access Token when requested
npm run publish-debug-package

# Start debugging locally
npm run debug
```

## How to test

Run the following commands from within the Source\Extension.Voting folder.

```shell
npm run test
```

Install the debug version of the extension to your personal Azure DevOps account and start debugging.

For information on how to create a publisher and to acquire a personal access token please refer to [Microsoft Docs: Publish from the command line](https://docs.microsoft.com/en-us/azure/devops/extend/publish/command-line?view=vsts).

## Additional links

-   [Visual Studio Marketplace: AIT Voting Extension](https://marketplace.visualstudio.com/items?itemName=AITGmbH.asap-voting-aitgmb-de-production)
-   [AIT-Homepage](http://www.aitgmbh.de)
-   [AIT TFS-Tools](https://www.aitgmbh.de/downloads/?term=20&orderby=date&order=desc)
