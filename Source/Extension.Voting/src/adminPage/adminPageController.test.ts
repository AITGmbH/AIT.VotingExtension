
jest.mock("TFS/WorkItemTracking/RestClient", () => {});
import { getClient as getWitClient } from "TFS/WorkItemTracking/RestClient";

import { AdminPageService } from "./adminPageService";
import { AdminPageController } from "./adminPageController";
import * as typemoq from "typemoq";

class VSS {
    ServiceIds: any;
    getWebContext(): any {}
    async getService<T>(contributionId: string): Promise<any> {}
}

const vssMock = typemoq.Mock.ofType<VSS>();
vssMock.setup(s => s.ServiceIds).returns(() => { 
    return { ExtensionData: "extensionData" };
});
vssMock.setup(s => s.getWebContext()).returns(() => {
    return {
        collection: {
            name: "Test"
        }
    };
});
(<any>window).VSS = vssMock.object;

const adminPageServiceMock = typemoq.Mock.ofType<AdminPageService>();
AdminPageService.prototype = adminPageServiceMock.object;

(<any>document.getElementById) = () => {
    return { 
        classList: {
            remove: () => {}
        }
    }
};

describe('mounted', () => {
    it('should load data', () => {
        const controller = new AdminPageController();
        controller.mounted();

        adminPageServiceMock.verify(s => s.loadAsync(), typemoq.Times.atLeastOnce());
    });
});