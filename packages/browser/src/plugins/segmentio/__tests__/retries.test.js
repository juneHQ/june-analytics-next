"use strict";
exports.__esModule = true;
var tslib_1 = require("tslib");
var __1 = require("..");
var analytics_1 = require("../../../core/analytics");
// @ts-ignore isOffline mocked dependency is accused as unused
var connection_1 = require("../../../core/connection");
var page_enrichment_1 = require("../../page-enrichment");
var schedule_flush_1 = require("../schedule-flush");
var PPQ = tslib_1.__importStar(require("../../../lib/priority-queue/persisted"));
var PQ = tslib_1.__importStar(require("../../../lib/priority-queue"));
jest.mock('../schedule-flush');
describe('Segment.io retries', function () {
    var options;
    var analytics;
    var segment;
    var queue;
    [false, true].forEach(function (persistenceIsDisabled) {
        describe("disableClientPersistence: " + persistenceIsDisabled, function () {
            beforeEach(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            jest.resetAllMocks();
                            jest.restoreAllMocks();
                            // @ts-expect-error reassign import
                            connection_1.isOffline = jest.fn().mockImplementation(function () { return true; });
                            options = { apiKey: 'foo' };
                            analytics = new analytics_1.Analytics({ writeKey: options.apiKey }, {
                                retryQueue: true,
                                disableClientPersistence: persistenceIsDisabled
                            });
                            if (persistenceIsDisabled) {
                                queue = new PQ.PriorityQueue(3, []);
                                queue['__type'] = 'priority';
                                Object.defineProperty(PQ, 'PriorityQueue', {
                                    writable: true,
                                    value: jest.fn().mockImplementation(function () { return queue; })
                                });
                            }
                            else {
                                queue = new PPQ.PersistedPriorityQueue(3, "test-Segment.io");
                                queue['__type'] = 'persisted';
                                Object.defineProperty(PPQ, 'PersistedPriorityQueue', {
                                    writable: true,
                                    value: jest.fn().mockImplementation(function () { return queue; })
                                });
                            }
                            segment = __1.segmentio(analytics, options, {});
                            return [4 /*yield*/, analytics.register(segment, page_enrichment_1.pageEnrichment)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test("add events to the queue", function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                var ctx;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            jest.spyOn(queue, 'push');
                            return [4 /*yield*/, analytics.track('event')];
                        case 1:
                            ctx = _a.sent();
                            expect(schedule_flush_1.scheduleFlush).toHaveBeenCalled();
                            /* eslint-disable  @typescript-eslint/unbound-method */
                            expect(queue.push).toHaveBeenCalled();
                            expect(queue.length).toBe(1);
                            expect(ctx.attempts).toBe(1);
                            expect(connection_1.isOffline).toHaveBeenCalledTimes(2);
                            expect(queue.__type).toBe(persistenceIsDisabled ? 'priority' : 'persisted');
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
});
//# sourceMappingURL=retries.test.js.map