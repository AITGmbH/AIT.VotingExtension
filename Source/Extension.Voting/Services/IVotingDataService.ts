interface IVotingDataService {
    getAllVotings(): Promise<any[]>;
    storeDocument(doc: any);
}



