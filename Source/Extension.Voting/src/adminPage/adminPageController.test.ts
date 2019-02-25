jest.mock("TFS/WorkItemTracking/RestClient", () => {});
import { getClient as getWitClient } from "TFS/WorkItemTracking/RestClient";

import { AdminPageService } from "./adminPageService";
import { AdminPageController } from "./adminPageController";
import * as typemoq from "typemoq";
import moment from "moment-timezone";

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
                name: "Test"
            },
            project: {
                id: "123"
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
    };
};

/*
function addElement(id: string) {
    const element = document.createElement("div");
    element.id = id;
    document.body.appendChild(element);
    return element;
}


does not work
describe('mounted', () => {
    beforeEach(() => {
        addElement('adminPage');
    })

    it('should load data', async () => {
        const controller = new AdminPageController();
        controller.$mount("#adminPage")
        await flushPromises();

        adminPageServiceMock.verify(s => s.loadAsync(), typemoq.Times.atLeastOnce());
    });
});*/

describe("Set StartTime", () => {
    it("should only modify the time part", () => {
        // UTC+11; => https://timezonedb.com/time-zones/Asia/Srednekolymsk
        moment.tz.setDefault("Asia/Srednekolymsk");

        const controller = new AdminPageController();

        controller.actualVoting.start = moment
            .utc()
            .year(2017)
            .month(11)
            .date(13)
            .valueOf();
        controller.startTime = "15:00";

        var actualDateTime = moment.utc(controller.actualVoting.start);
        expect(actualDateTime.year()).toBe(2017);
        expect(actualDateTime.month()).toBe(11);
        expect(actualDateTime.date()).toBe(13);
        expect(actualDateTime.hours()).toBe(4);
        expect(actualDateTime.minutes()).toBe(0);
    });

    it("should only modify the time part, event if the difference would be on different date", () => {
        // UTC+11; => https://timezonedb.com/time-zones/Asia/Srednekolymsk
        moment.tz.setDefault("Etc/GMT+6");

        const controller = new AdminPageController();

        controller.actualVoting.start = moment
            .utc()
            .year(2017)
            .month(11)
            .date(13)
            .valueOf();
        controller.startTime = "10:00";

        var actualDateTime = moment.utc(controller.actualVoting.start);
        expect(actualDateTime.year()).toBe(2017);
        expect(actualDateTime.month()).toBe(11);
        expect(actualDateTime.date()).toBe(13);
        expect(actualDateTime.hours()).toBe(16);
        expect(actualDateTime.minutes()).toBe(0);
    });
});

describe("Set StartDate", () => {
    it("should only modify the date part", () => {
        moment.tz.setDefault("Etc/UTC");

        const controller = new AdminPageController();

        controller.actualVoting.start = moment
            .utc()
            .year(2017)
            .month(11)
            .date(1)
            .hour(12)
            .minute(55)
            .valueOf();
        controller.startDate = "2010-01-14";

        var actualDateTime = moment.utc(controller.actualVoting.start);
        expect(actualDateTime.year()).toBe(2010);
        expect(actualDateTime.month()).toBe(0);
        expect(actualDateTime.date()).toBe(14);
        expect(actualDateTime.hours()).toBe(12);
        expect(actualDateTime.minutes()).toBe(55);
    });

    it("should only modify the date part, even with a huge utc offset", () => {
        // UTC+11; => https://timezonedb.com/time-zones/Asia/Srednekolymsk
        moment.tz.setDefault("Asia/Srednekolymsk");

        const controller = new AdminPageController();

        controller.actualVoting.start = moment
            .utc()
            .year(2017)
            .month(11)
            .date(1)
            .hour(12)
            .minute(55)
            .valueOf();
        controller.startDate = "2010-01-14";

        var actualDateTime = moment.utc(controller.actualVoting.start);
        expect(actualDateTime.year()).toBe(2010);
        expect(actualDateTime.month()).toBe(0);
        expect(actualDateTime.date()).toBe(14);
        expect(actualDateTime.hours()).toBe(12);
        expect(actualDateTime.minutes()).toBe(55);
    });
});

describe("Set EndDate", () => {
    it("should only modify the date part", () => {
        moment.tz.setDefault("Etc/UTC");

        const controller = new AdminPageController();

        controller.actualVoting.end = moment
            .utc()
            .year(2017)
            .month(11)
            .date(1)
            .hour(12)
            .minute(55)
            .valueOf();
        controller.endDate = "2010-01-14";

        var actualDateTime = moment.utc(controller.actualVoting.end);
        expect(actualDateTime.year()).toBe(2010);
        expect(actualDateTime.month()).toBe(0);
        expect(actualDateTime.date()).toBe(14);
        expect(actualDateTime.hours()).toBe(12);
        expect(actualDateTime.minutes()).toBe(55);
    });

    it("should only modify the date part, even with a huge utc offset", () => {
        // UTC+11; => https://timezonedb.com/time-zones/Asia/Srednekolymsk
        moment.tz.setDefault("Asia/Srednekolymsk");

        const controller = new AdminPageController();

        controller.actualVoting.end = moment
            .utc()
            .year(2017)
            .month(11)
            .date(1)
            .hour(12)
            .minute(55)
            .valueOf();
        controller.endDate = "2010-01-14";

        var actualDateTime = moment.utc(controller.actualVoting.end);
        expect(actualDateTime.year()).toBe(2010);
        expect(actualDateTime.month()).toBe(0);
        expect(actualDateTime.date()).toBe(14);
        expect(actualDateTime.hours()).toBe(12);
        expect(actualDateTime.minutes()).toBe(55);
    });
});

describe("Set EndTime", () => {
    it("should only modify the time part", () => {
        // UTC+11; => https://timezonedb.com/time-zones/Asia/Srednekolymsk
        moment.tz.setDefault("Asia/Srednekolymsk");

        const controller = new AdminPageController();

        controller.actualVoting.end = moment
            .utc()
            .year(2017)
            .month(11)
            .date(13)
            .valueOf();
        controller.endTime = "15:00";

        var actualDateTime = moment.utc(controller.actualVoting.end);
        expect(actualDateTime.year()).toBe(2017);
        expect(actualDateTime.month()).toBe(11);
        expect(actualDateTime.date()).toBe(13);
        expect(actualDateTime.hours()).toBe(4);
        expect(actualDateTime.minutes()).toBe(0);
    });

    it("should only modify the time part, event if the difference would be on different date", () => {
        // UTC+11; => https://timezonedb.com/time-zones/Asia/Srednekolymsk
        moment.tz.setDefault("Etc/GMT+6");

        const controller = new AdminPageController();

        controller.actualVoting.end = moment
            .utc()
            .year(2017)
            .month(11)
            .date(13)
            .valueOf();
        controller.endTime = "10:00";

        var actualDateTime = moment.utc(controller.actualVoting.end);
        expect(actualDateTime.year()).toBe(2017);
        expect(actualDateTime.month()).toBe(11);
        expect(actualDateTime.date()).toBe(13);
        expect(actualDateTime.hours()).toBe(16);
        expect(actualDateTime.minutes()).toBe(0);
    });
});
