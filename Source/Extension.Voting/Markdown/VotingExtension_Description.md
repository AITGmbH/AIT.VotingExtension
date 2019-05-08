# Voting Extension

Democratize your backlog with Voting Extension. Ask your stakeholders to vote for their favorite backlog items. Align your work on your stakeholders' needs.

## Quick Steps

1. Create a new voting
2. Specify the title and the description (optional) why the actual voting is necessary
3. Decide whether multiple voting per item is allowed
4. Decide between backlog-based vs. query-based voting
5. Click on save
    - Voting starts
    - Each team member can now vote on the included work items
6. **[For backlog-based voting]** Apply the (interim) results to the backlog

## Changelog

For more detailed release notes please refer to our [release blog posts](https://www.aitgmbh.de/blog/).

- **Version "__BuildNumber__"**
  - Introduction of voting types: backlog-based and query-based votings
  - Limit votes per work item (in addition to limit per user)
  - Support for fixed voting period: start and end date for a voting can be configured
  - Summary of finished voting on admin page with possibility to copy to HTML
  - Icon in vertical navigation
  - Moved apply to backlog option to report page for terminated votings
  - Bugfixes
    - Solves problem that terms of use can not be confirmed
    - "Assigned to" is displayed correctly

## Known Limitations

- The extension is only supported in Chrome.

## Additional Links

- [AIT-Homepage](http://www.aitgmbh.de/)
- [AIT TFS-Tools](https://www.aitgmbh.de/downloads/?term=20&orderby=date&order=desc)

## Privacy Information

Please note that when using the Voting Extension personal and confidential information is only saved in your Azure DevOps account using the built-in Azure DevOps data storage service "Team Services ExtensionDataService". You find more information about that service at [Microsoft Docs: Azure DevOps Data storage](https://docs.microsoft.com/en-us/vsts/extend/develop/data-storage?view=vsts).

We also collect some telemetry data using Application Insights ("AI"). As part of AI telemetry collection the standard AI telemetry data ([Microsoft Docs: Data collection, retention and storage in Application Insights](https://docs.microsoft.com/en-us/azure/application-insights/app-insights-data-retention-privacy))
as well as the (Azure DevOps/TFS) account name and Team Project id is tracked.

For general information on data protection, please refer to our data protection declaration.
