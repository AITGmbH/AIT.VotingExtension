import { VotingDataService } from "./votingDataService";
import * as typemoq from "typemoq";

const collectionName = "Test";

class VSS {
    ServiceIds: any;
    getWebContext(): any {}
    async getService<T>(contributionId: string): Promise<any> {}
}

const vssMock = typemoq.Mock.ofType<VSS>();
vssMock
    .setup(s => s.ServiceIds)
    .returns(() => {
        return { ExtensionData: "extensionData" };
    });
vssMock
    .setup(s => s.getWebContext())
    .returns(() => {
        return {
            collection: {
                name: collectionName
            }
        };
    });
(<any>window).VSS = vssMock.object;

describe("getAllVotings", () => {
    it("should return votings", async () => {
        const votings = ["voting1", "voting2"];

        vssMock
            .setup(s => s.getService(typemoq.It.isAny()))
            .returns(async () => {
                return {
                    getDocuments: () => {
                        return votings;
                    }
                };
            });

        var service = new VotingDataService();
        var result = await service.getAllVotingsAsync();

        expect(result).not.toBeNull();
        expect(result).toBe(votings);
    });

    it("should return empty array on error", async () => {
        vssMock.setup(s => s.getService("extensionData")).throws(new Error());

        var service = new VotingDataService();
        var result = await service.getAllVotingsAsync();

        expect(result).not.toBeNull();
        expect(result).toHaveLength(0);
    });
});
