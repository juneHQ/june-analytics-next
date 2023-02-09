"use strict";
exports.__esModule = true;
var tslib_1 = require("tslib");
var analytics_1 = require("../../../core/analytics");
var __1 = require("..");
var segmentio_1 = require("../../segmentio");
var settings = {
    integrations: {
        'Braze Web Mode (Actions)': {},
        // note that Fullstory's name here doesn't contain 'Actions'
        Fullstory: {},
        'Segment.io': {}
    },
    remotePlugins: [
        {
            name: 'Braze Web Mode (Actions)',
            creationName: 'Braze Web Mode (Actions)',
            libraryName: 'brazeDestination',
            url: 'https://cdn.segment.com/next-integrations/actions/braze/9850d2cc8308a89db62a.js',
            settings: {
                subscriptions: [
                    {
                        partnerAction: 'trackEvent'
                    },
                    {
                        partnerAction: 'updateUserProfile'
                    },
                    {
                        partnerAction: 'trackPurchase'
                    },
                ]
            }
        },
        {
            // note that Fullstory name contains 'Actions'
            name: 'Fullstory (Actions)',
            creationName: 'Fullstory (Actions)',
            libraryName: 'fullstoryDestination',
            url: 'https://cdn.segment.com/next-integrations/actions/fullstory/35ea1d304f85f3306f48.js',
            settings: {
                subscriptions: [
                    {
                        partnerAction: 'trackEvent'
                    },
                    {
                        partnerAction: 'identifyUser'
                    },
                ]
            }
        },
    ]
};
var trackEvent = {
    name: 'Braze Web Mode (Actions) trackEvent',
    type: 'destination',
    version: '1.0',
    load: function (_ctx) {
        return Promise.resolve();
    },
    isLoaded: function () {
        return true;
    },
    track: function (ctx) { return tslib_1.__awaiter(void 0, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
        return [2 /*return*/, ctx];
    }); }); },
    identify: function (ctx) { return tslib_1.__awaiter(void 0, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
        return [2 /*return*/, ctx];
    }); }); },
    page: function (ctx) { return tslib_1.__awaiter(void 0, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
        return [2 /*return*/, ctx];
    }); }); },
    group: function (ctx) { return tslib_1.__awaiter(void 0, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
        return [2 /*return*/, ctx];
    }); }); },
    alias: function (ctx) { return tslib_1.__awaiter(void 0, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
        return [2 /*return*/, ctx];
    }); }); }
};
var trackPurchase = tslib_1.__assign(tslib_1.__assign({}, trackEvent), { name: 'Braze Web Mode (Actions) trackPurchase' });
var updateUserProfile = tslib_1.__assign(tslib_1.__assign({}, trackEvent), { name: 'Braze Web Mode (Actions) updateUserProfile' });
var amplitude = tslib_1.__assign(tslib_1.__assign({}, trackEvent), { name: 'amplitude' });
var fullstory = tslib_1.__assign(tslib_1.__assign({}, trackEvent), { name: 'Fullstory (Actions) trackEvent' });
describe('schema filter', function () {
    var options;
    var filterXt;
    var segment;
    var ajs;
    beforeEach(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            jest.resetAllMocks();
            jest.restoreAllMocks();
            options = { apiKey: 'foo' };
            ajs = new analytics_1.Analytics({ writeKey: options.apiKey });
            segment = segmentio_1.segmentio(ajs, options, {});
            filterXt = __1.schemaFilter({}, settings);
            jest.spyOn(segment, 'track');
            jest.spyOn(trackEvent, 'track');
            jest.spyOn(trackPurchase, 'track');
            jest.spyOn(updateUserProfile, 'track');
            jest.spyOn(amplitude, 'track');
            jest.spyOn(fullstory, 'track');
            return [2 /*return*/];
        });
    }); });
    describe('plugins and destinations', function () {
        it('loads plugin', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ajs.register(filterXt)];
                    case 1:
                        _a.sent();
                        expect(filterXt.isLoaded()).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not drop events when no plan is defined', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ajs.register(segment, trackEvent, trackPurchase, updateUserProfile, __1.schemaFilter({}, settings))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, ajs.track('A Track Event')];
                    case 2:
                        _a.sent();
                        expect(segment.track).toHaveBeenCalled();
                        expect(trackEvent.track).toHaveBeenCalled();
                        expect(trackPurchase.track).toHaveBeenCalled();
                        expect(updateUserProfile.track).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('drops an event when the event is disabled', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ajs.register(segment, trackEvent, trackPurchase, updateUserProfile, amplitude, __1.schemaFilter({
                            hi: {
                                enabled: true,
                                integrations: {
                                    'Braze Web Mode (Actions)': false
                                }
                            }
                        }, settings))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, ajs.track('hi')];
                    case 2:
                        _a.sent();
                        expect(segment.track).toHaveBeenCalled();
                        expect(amplitude.track).toHaveBeenCalled();
                        expect(trackEvent.track).not.toHaveBeenCalled();
                        expect(trackPurchase.track).not.toHaveBeenCalled();
                        expect(updateUserProfile.track).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not drop events with different names', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ajs.register(segment, trackEvent, trackPurchase, updateUserProfile, amplitude, __1.schemaFilter({
                            'Fake Track Event': {
                                enabled: true,
                                integrations: { amplitude: false }
                            }
                        }, settings))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, ajs.track('Track Event')];
                    case 2:
                        _a.sent();
                        expect(segment.track).toHaveBeenCalled();
                        expect(amplitude.track).toHaveBeenCalled();
                        expect(trackEvent.track).toHaveBeenCalled();
                        expect(trackPurchase.track).toHaveBeenCalled();
                        expect(updateUserProfile.track).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not drop events with same name when unplanned events are disallowed', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ajs.register(segment, trackEvent, trackPurchase, updateUserProfile, amplitude, __1.schemaFilter({
                            __default: { enabled: false, integrations: {} },
                            'Track Event': {
                                enabled: true,
                                integrations: {}
                            }
                        }, settings))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, ajs.track('Track Event')];
                    case 2:
                        _a.sent();
                        expect(segment.track).toHaveBeenCalled();
                        expect(amplitude.track).toHaveBeenCalled();
                        expect(trackEvent.track).toHaveBeenCalled();
                        expect(trackPurchase.track).toHaveBeenCalled();
                        expect(updateUserProfile.track).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('drop events with different names when unplanned events are disallowed', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ajs.register(segment, trackEvent, trackPurchase, updateUserProfile, amplitude, __1.schemaFilter({
                            __default: { enabled: false, integrations: {} },
                            'Fake Track Event': {
                                enabled: true,
                                integrations: {}
                            }
                        }, settings))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, ajs.track('Track Event')];
                    case 2:
                        _a.sent();
                        expect(segment.track).toHaveBeenCalled();
                        expect(amplitude.track).not.toHaveBeenCalled();
                        expect(trackEvent.track).not.toHaveBeenCalled();
                        expect(trackPurchase.track).not.toHaveBeenCalled();
                        expect(updateUserProfile.track).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('drops enabled event for matching destination', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ajs.register(segment, trackEvent, trackPurchase, updateUserProfile, amplitude, __1.schemaFilter({
                            'Track Event': {
                                enabled: true,
                                integrations: { amplitude: false }
                            }
                        }, settings))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, ajs.track('Track Event')];
                    case 2:
                        _a.sent();
                        expect(segment.track).toHaveBeenCalled();
                        expect(trackEvent.track).toHaveBeenCalled();
                        expect(trackPurchase.track).toHaveBeenCalled();
                        expect(updateUserProfile.track).toHaveBeenCalled();
                        expect(amplitude.track).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not drop event for non-matching destination', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var filterXt;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filterXt = __1.schemaFilter({
                            'Track Event': {
                                enabled: true,
                                integrations: { 'not amplitude': false }
                            }
                        }, settings);
                        return [4 /*yield*/, ajs.register(segment, trackEvent, trackPurchase, updateUserProfile, amplitude, filterXt)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, ajs.track('Track Event')];
                    case 2:
                        _a.sent();
                        expect(segment.track).toHaveBeenCalled();
                        expect(trackEvent.track).toHaveBeenCalled();
                        expect(trackPurchase.track).toHaveBeenCalled();
                        expect(updateUserProfile.track).toHaveBeenCalled();
                        expect(amplitude.track).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not drop enabled event with enabled destination', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var filterXt;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filterXt = __1.schemaFilter({
                            'Track Event': {
                                enabled: true,
                                integrations: { amplitude: true }
                            }
                        }, settings);
                        return [4 /*yield*/, ajs.register(segment, trackEvent, trackPurchase, updateUserProfile, amplitude, filterXt)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, ajs.track('Track Event')];
                    case 2:
                        _a.sent();
                        expect(segment.track).toHaveBeenCalled();
                        expect(trackEvent.track).toHaveBeenCalled();
                        expect(trackPurchase.track).toHaveBeenCalled();
                        expect(updateUserProfile.track).toHaveBeenCalled();
                        expect(amplitude.track).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('properly sets event integrations object with enabled plan', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var filterXt, ctx;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filterXt = __1.schemaFilter({
                            'Track Event': {
                                enabled: true,
                                integrations: { amplitude: true }
                            }
                        }, settings);
                        return [4 /*yield*/, ajs.register(segment, trackEvent, trackPurchase, updateUserProfile, amplitude, filterXt)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, ajs.track('Track Event')];
                    case 2:
                        ctx = _a.sent();
                        expect(ctx.event.integrations).toEqual({ amplitude: true });
                        expect(segment.track).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('sets event integrations object when integration is disabled', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var filterXt, ctx;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filterXt = __1.schemaFilter({
                            'Track Event': {
                                enabled: true,
                                integrations: { amplitude: false }
                            }
                        }, settings);
                        return [4 /*yield*/, ajs.register(segment, trackEvent, trackPurchase, updateUserProfile, amplitude, filterXt)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, ajs.track('Track Event')];
                    case 2:
                        ctx = _a.sent();
                        expect(segment.track).toHaveBeenCalled();
                        expect(trackEvent.track).toHaveBeenCalled();
                        expect(trackPurchase.track).toHaveBeenCalled();
                        expect(updateUserProfile.track).toHaveBeenCalled();
                        expect(amplitude.track).not.toHaveBeenCalled();
                        expect(ctx.event.integrations).toEqual({ amplitude: false });
                        return [2 /*return*/];
                }
            });
        }); });
        it('doesnt set event integrations object with different event', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var filterXt, ctx;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filterXt = __1.schemaFilter({
                            'Track Event': {
                                enabled: true,
                                integrations: { amplitude: true }
                            }
                        }, settings);
                        return [4 /*yield*/, ajs.register(segment, trackEvent, trackPurchase, updateUserProfile, amplitude, filterXt)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, ajs.track('Not Track Event')];
                    case 2:
                        ctx = _a.sent();
                        expect(ctx.event.integrations).toEqual({});
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('action destinations', function () {
        it('disables action destinations', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var filterXt;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filterXt = __1.schemaFilter({
                            'Track Event': {
                                enabled: true,
                                integrations: {
                                    'Braze Web Mode (Actions)': false
                                }
                            },
                            __default: {
                                enabled: true,
                                integrations: {}
                            },
                            hi: {
                                enabled: true,
                                integrations: {
                                    'Braze Web Mode (Actions)': false
                                }
                            }
                        }, settings);
                        return [4 /*yield*/, ajs.register(segment, trackEvent, trackPurchase, updateUserProfile, amplitude, filterXt)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, ajs.track('Track Event')];
                    case 2:
                        _a.sent();
                        expect(segment.track).toHaveBeenCalled();
                        expect(amplitude.track).toHaveBeenCalled();
                        expect(trackEvent.track).not.toHaveBeenCalled();
                        expect(trackPurchase.track).not.toHaveBeenCalled();
                        expect(updateUserProfile.track).not.toHaveBeenCalled();
                        return [4 /*yield*/, ajs.track('a non blocked event')];
                    case 3:
                        _a.sent();
                        expect(segment.track).toHaveBeenCalled();
                        expect(amplitude.track).toHaveBeenCalled();
                        expect(trackEvent.track).toHaveBeenCalled();
                        expect(trackPurchase.track).toHaveBeenCalled();
                        expect(updateUserProfile.track).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('covers different names between remote plugins and integrations', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var filterXt;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filterXt = __1.schemaFilter({
                            hi: {
                                enabled: true,
                                integrations: {
                                    // note that Fullstory's name here does not contain 'Actions'
                                    Fullstory: false
                                }
                            }
                        }, settings);
                        return [4 /*yield*/, ajs.register(segment, trackEvent, trackPurchase, updateUserProfile, amplitude, fullstory, filterXt)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, ajs.track('hi')];
                    case 2:
                        _a.sent();
                        expect(segment.track).toHaveBeenCalled();
                        expect(amplitude.track).toHaveBeenCalled();
                        expect(trackEvent.track).toHaveBeenCalled();
                        expect(trackPurchase.track).toHaveBeenCalled();
                        expect(updateUserProfile.track).toHaveBeenCalled();
                        expect(fullstory.track).not.toHaveBeenCalled();
                        return [4 /*yield*/, ajs.track('a non blocked event')];
                    case 3:
                        _a.sent();
                        expect(segment.track).toHaveBeenCalled();
                        expect(amplitude.track).toHaveBeenCalled();
                        expect(trackEvent.track).toHaveBeenCalled();
                        expect(trackPurchase.track).toHaveBeenCalled();
                        expect(updateUserProfile.track).toHaveBeenCalled();
                        expect(fullstory.track).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=index.test.js.map