class ReportCreationService implements IReportCreationService {

    createReport(doc: Voting): Promise<string> {
       
        return new Promise((resolve, reject) => {
            resolve(this.gernerateReport(doc)),
                reject("Error");
        });
    }


    gernerateReport(voting: Voting): string {
         return "Not implemented";
    };
}