interface IReportCreationService {
    createReport(doc: Voting): Promise<string>;
}