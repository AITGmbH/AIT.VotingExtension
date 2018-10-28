# AIT Voting Extension

Democratize your backlog with Voting Extension. Ask your stakeholders to vote for their favorite backlog items. Align your work on your stakeholders' needs.

Click the picture below to see a demo video.
[!["Demo video"](https://asap-voting-preview.azurewebsites.net/Video/VotingExtensionDemo_First_Frame.png)](https://youtu.be/GvzbQba2cGU)

## Requirements
- The extension can only be used with TFS 2015 Update 3 and higher if SSL communication is enabled
- Only unfinished Work Items can be voted

## Quick Steps
1. Create a new voting 
2. Specify the title and the description why the actual voting is necessary (Optional)
3. Decide whether multiple voting per item is allowed
4. Decides which Work Item Type should be displayed
5. With click on save the voting got started
6. Each team member votes for the items it want to see on the top of the team backlog
7. Appliy the (interim) results to backlog 

## References

The Voting Extension is not a self-hosted extension but its resources are hosted in Azure. That implies that the [VSIX-package](https://docs.microsoft.com/en-us/visualstudio/extensibility/anatomy-of-a-vsix-package) does not include the necessary code files to run the extension but the extension manifest references an azure-hosted website provided by AIT. Thus in order to test your own adaptions you have to set up the appropriate Azure resources in your account and adapt the reference in the extension manifest. As an alternative way you can change the extension to be self-hosted.

Please note that the build and release infrastructure for the repo is hosted by AIT.

## How to build

```shell

# Restore node-modules and create new extension version (run the following command from within the folder ~\Source\Extension.Voting)
npm install
npm run publish-debug-package

# Start debugging locally
npm run debug
```

Install the debug version of the extension to your personal Azure DevOps account and start debugging.

## Additional links
- [Visual Studio Marketplace: AIT Voting Extension](https://marketplace.visualstudio.com/items?itemName=AITGmbH.asap-voting-aitgmb-de-production)
- [AIT-Homepage](http://www.aitgmbh.de)
- [AIT TFS-Tools](https://www.aitgmbh.de/downloads/?term=20&orderby=date&order=desc)
