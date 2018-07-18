interface IVotingDataService {
    getAllVotings(): Promise<any[]>;//shold be Promise<TeamContext[]>
    storeDocument(doc: any);
    getTeamVoting(teamid: string): Promise<any>;//shold be Promise<TeamContext[]>
}



