"use strict";
exports.__esModule = true;
var tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-floating-promises */
var cdn_settings_1 = require("../../test-helpers/fixtures/cdn-settings");
var create_fetch_method_1 = require("../../test-helpers/fixtures/create-fetch-method");
var context_1 = require("../../core/context");
var jsdom_1 = require("jsdom");
var analytics_1 = require("../../core/analytics");
var ajs_destination_1 = require("../../plugins/ajs-destination");
var persisted_1 = require("../../lib/priority-queue/persisted");
// @ts-ignore loadLegacySettings mocked dependency is accused as unused
var __1 = require("..");
// @ts-ignore isOffline mocked dependency is accused as unused
var connection_1 = require("../../core/connection");
var SegmentPlugin = tslib_1.__importStar(require("../../plugins/segmentio"));
var js_cookie_1 = tslib_1.__importDefault(require("js-cookie"));
var priority_queue_1 = require("../../lib/priority-queue");
var parse_cdn_1 = require("../../lib/parse-cdn");
var browser_storage_1 = require("../../test-helpers/browser-storage");
var fetch_parse_1 = require("../../test-helpers/fetch-parse");
var remote_loader_1 = require("../../plugins/remote-loader");
var fetchCalls = [];
jest.mock('unfetch', function () {
    return {
        __esModule: true,
        "default": function (url, body) {
            var call = fetch_parse_1.parseFetchCall([url, body]);
            fetchCalls.push(call);
            return create_fetch_method_1.createMockFetchImplementation(cdn_settings_1.cdnSettingsKitchenSink)(url, body);
        }
    };
});
var sleep = function (time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
};
var xt = {
    name: 'Test Plugin',
    type: 'utility',
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
var amplitude = tslib_1.__assign(tslib_1.__assign({}, xt), { name: 'Amplitude', type: 'destination' });
var googleAnalytics = tslib_1.__assign(tslib_1.__assign({}, xt), { name: 'Google Analytics', type: 'destination' });
var enrichBilling = tslib_1.__assign(tslib_1.__assign({}, xt), { name: 'Billing Enrichment', type: 'enrichment', track: function (ctx) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            ctx.event.properties = tslib_1.__assign(tslib_1.__assign({}, ctx.event.properties), { billingPlan: 'free-99' });
            return [2 /*return*/, ctx];
        });
    }); } });
var writeKey = 'foo';
var amplitudeWriteKey = 'bar';
beforeEach(function () {
    parse_cdn_1.setGlobalCDNUrl(undefined);
});
describe('Initialization', function () {
    beforeEach(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            fetchCalls = [];
            jest.resetAllMocks();
            jest.resetModules();
            return [2 /*return*/];
        });
    }); });
    it('loads plugins', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({
                        writeKey: writeKey,
                        plugins: [xt]
                    })];
                case 1:
                    _a.sent();
                    expect(xt.isLoaded()).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('loads async plugins', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var pluginLoaded, onLoad, lazyPlugin;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pluginLoaded = false;
                    onLoad = jest.fn(function () {
                        pluginLoaded = true;
                    });
                    lazyPlugin = {
                        name: 'Test 2',
                        type: 'utility',
                        version: '1.0',
                        load: function (_ctx) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                            return tslib_1.__generator(this, function (_a) {
                                setTimeout(onLoad, 300);
                                return [2 /*return*/];
                            });
                        }); },
                        isLoaded: function () {
                            return pluginLoaded;
                        }
                    };
                    jest.spyOn(lazyPlugin, 'load');
                    return [4 /*yield*/, __1.AnalyticsBrowser.load({ writeKey: writeKey, plugins: [lazyPlugin] })];
                case 1:
                    _a.sent();
                    expect(lazyPlugin.load).toHaveBeenCalled();
                    expect(onLoad).not.toHaveBeenCalled();
                    expect(pluginLoaded).toBe(false);
                    return [4 /*yield*/, sleep(300)];
                case 2:
                    _a.sent();
                    expect(onLoad).toHaveBeenCalled();
                    expect(pluginLoaded).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('ready method is called only when all plugins with ready have declared themselves as ready', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var ready, lazyPlugin1, lazyPlugin2, analytics;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ready = jest.fn();
                    lazyPlugin1 = {
                        name: 'Test 2',
                        type: 'destination',
                        version: '1.0',
                        load: function (_ctx) { return tslib_1.__awaiter(void 0, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                            return [2 /*return*/];
                        }); }); },
                        ready: function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                            return tslib_1.__generator(this, function (_a) {
                                return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, 300); })];
                            });
                        }); },
                        isLoaded: function () { return true; }
                    };
                    lazyPlugin2 = {
                        name: 'Test 2',
                        type: 'destination',
                        version: '1.0',
                        load: function (_ctx) { return tslib_1.__awaiter(void 0, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                            return [2 /*return*/];
                        }); }); },
                        ready: function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                            return tslib_1.__generator(this, function (_a) {
                                return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                            });
                        }); },
                        isLoaded: function () { return true; }
                    };
                    jest.spyOn(lazyPlugin1, 'load');
                    jest.spyOn(lazyPlugin2, 'load');
                    return [4 /*yield*/, __1.AnalyticsBrowser.load({
                            writeKey: writeKey,
                            plugins: [lazyPlugin1, lazyPlugin2, xt]
                        })
                        // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    ];
                case 1:
                    analytics = (_a.sent())[0];
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    analytics.ready(ready);
                    expect(lazyPlugin1.load).toHaveBeenCalled();
                    expect(lazyPlugin2.load).toHaveBeenCalled();
                    expect(ready).not.toHaveBeenCalled();
                    return [4 /*yield*/, sleep(100)];
                case 2:
                    _a.sent();
                    expect(ready).not.toHaveBeenCalled();
                    return [4 /*yield*/, sleep(200)];
                case 3:
                    _a.sent();
                    expect(ready).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    describe('cdn', function () {
        it('should get the correct CDN in plugins if the CDN overridden', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var overriddenCDNUrl;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        overriddenCDNUrl = 'http://cdn.segment.com' // http instead of https
                        ;
                        return [4 /*yield*/, __1.AnalyticsBrowser.load({
                                cdnURL: overriddenCDNUrl,
                                writeKey: writeKey,
                                plugins: [
                                    tslib_1.__assign(tslib_1.__assign({}, xt), { load: function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                                            return tslib_1.__generator(this, function (_a) {
                                                expect(window.analytics).toBeUndefined();
                                                expect(parse_cdn_1.getCDN()).toContain(overriddenCDNUrl);
                                                return [2 /*return*/];
                                            });
                                        }); } }),
                                ]
                            })];
                    case 1:
                        _a.sent();
                        expect(fetchCalls[0].url).toContain(overriddenCDNUrl);
                        expect.assertions(3);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    it('calls page if initialpageview is set', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var mockPage;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jest.mock('../../core/analytics');
                    mockPage = jest.fn().mockImplementation(function () { return Promise.resolve(); });
                    analytics_1.Analytics.prototype.page = mockPage;
                    return [4 /*yield*/, __1.AnalyticsBrowser.load({ writeKey: writeKey }, { initialPageview: true })];
                case 1:
                    _a.sent();
                    expect(mockPage).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    it('does not call page if initialpageview is not set', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var mockPage;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jest.mock('../../core/analytics');
                    mockPage = jest.fn();
                    analytics_1.Analytics.prototype.page = mockPage;
                    return [4 /*yield*/, __1.AnalyticsBrowser.load({ writeKey: writeKey }, { initialPageview: false })];
                case 1:
                    _a.sent();
                    expect(mockPage).not.toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    it('does not use a persisted queue when disableClientPersistence is true', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var ajs;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({
                        writeKey: writeKey
                    }, {
                        disableClientPersistence: true
                    })];
                case 1:
                    ajs = (_a.sent())[0];
                    expect(ajs.queue.queue instanceof priority_queue_1.PriorityQueue).toBe(true);
                    expect(ajs.queue.queue instanceof persisted_1.PersistedPriorityQueue).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    it('uses a persisted queue by default', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var ajs;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({
                        writeKey: writeKey
                    })];
                case 1:
                    ajs = (_a.sent())[0];
                    expect(ajs.queue.queue instanceof persisted_1.PersistedPriorityQueue).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('disables identity persistance when disableClientPersistence is true', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var ajs;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({
                        writeKey: writeKey
                    }, {
                        disableClientPersistence: true
                    })];
                case 1:
                    ajs = (_a.sent())[0];
                    expect(ajs.user().options.persist).toBe(false);
                    expect(ajs.group().options.persist).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    it('fetch remote source settings by default', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({
                        writeKey: writeKey
                    })];
                case 1:
                    _a.sent();
                    expect(fetchCalls.length).toBeGreaterThan(0);
                    expect(fetchCalls[0].url).toMatch(/\/settings$/);
                    return [2 /*return*/];
            }
        });
    }); });
    it('does not fetch source settings if cdnSettings is set', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({
                        writeKey: writeKey,
                        cdnSettings: { integrations: {} }
                    })];
                case 1:
                    _a.sent();
                    expect(fetchCalls.length).toBe(0);
                    return [2 /*return*/];
            }
        });
    }); });
    describe('options.integrations permutations', function () {
        var settings = { writeKey: writeKey };
        it('does not load Segment.io if integrations.All is false and Segment.io is not listed', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var options, analyticsResponse, segmentio;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = {
                            integrations: { All: false }
                        };
                        return [4 /*yield*/, __1.AnalyticsBrowser.load(settings, options)];
                    case 1:
                        analyticsResponse = _a.sent();
                        segmentio = analyticsResponse[0].queue.plugins.find(function (p) { return p.name === 'Segment.io'; });
                        expect(segmentio).toBeUndefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not load Segment.io if its set to false', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var options, analyticsResponse, segmentio;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = {
                            integrations: { 'Segment.io': false }
                        };
                        return [4 /*yield*/, __1.AnalyticsBrowser.load(settings, options)];
                    case 1:
                        analyticsResponse = _a.sent();
                        segmentio = analyticsResponse[0].queue.plugins.find(function (p) { return p.name === 'Segment.io'; });
                        expect(segmentio).toBeUndefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads Segment.io if integrations.All is false and Segment.io is listed', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var options, analyticsResponse, segmentio;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = {
                            integrations: { All: false, 'Segment.io': true }
                        };
                        return [4 /*yield*/, __1.AnalyticsBrowser.load(settings, options)];
                    case 1:
                        analyticsResponse = _a.sent();
                        segmentio = analyticsResponse[0].queue.plugins.find(function (p) { return p.name === 'Segment.io'; });
                        expect(segmentio).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads Segment.io if integrations.All is undefined', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var options, analyticsResponse, segmentio;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = {
                            integrations: { 'Segment.io': true }
                        };
                        return [4 /*yield*/, __1.AnalyticsBrowser.load(settings, options)];
                    case 1:
                        analyticsResponse = _a.sent();
                        segmentio = analyticsResponse[0].queue.plugins.find(function (p) { return p.name === 'Segment.io'; });
                        expect(segmentio).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads Segment.io if integrations is undefined', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var options, analyticsResponse, segmentio;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = {
                            integrations: undefined
                        };
                        return [4 /*yield*/, __1.AnalyticsBrowser.load(settings, options)];
                    case 1:
                        analyticsResponse = _a.sent();
                        segmentio = analyticsResponse[0].queue.plugins.find(function (p) { return p.name === 'Segment.io'; });
                        expect(segmentio).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads selected plugins when Segment.io is false', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var options, analyticsResponse, plugin, segmentio;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = {
                            integrations: {
                                'Test Plugin': true,
                                'Segment.io': false
                            }
                        };
                        return [4 /*yield*/, __1.AnalyticsBrowser.load(tslib_1.__assign(tslib_1.__assign({}, settings), { plugins: [xt] }), options)];
                    case 1:
                        analyticsResponse = _a.sent();
                        plugin = analyticsResponse[0].queue.plugins.find(function (p) { return p.name === 'Test Plugin'; });
                        segmentio = analyticsResponse[0].queue.plugins.find(function (p) { return p.name === 'Segment.io'; });
                        expect(plugin).toBeDefined();
                        expect(segmentio).toBeUndefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads selected plugins when Segment.io and All are false', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var options, analyticsResponse, plugin, segmentio;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = {
                            integrations: {
                                All: false,
                                'Test Plugin': true,
                                'Segment.io': false
                            }
                        };
                        return [4 /*yield*/, __1.AnalyticsBrowser.load(tslib_1.__assign(tslib_1.__assign({}, settings), { plugins: [xt] }), options)];
                    case 1:
                        analyticsResponse = _a.sent();
                        plugin = analyticsResponse[0].queue.plugins.find(function (p) { return p.name === 'Test Plugin'; });
                        segmentio = analyticsResponse[0].queue.plugins.find(function (p) { return p.name === 'Segment.io'; });
                        expect(plugin).toBeDefined();
                        expect(segmentio).toBeUndefined();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
describe('Dispatch', function () {
    it('dispatches events to destinations', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var ajs, segmentio, ampSpy, gaSpy, segmentSpy, boo;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({
                        writeKey: writeKey,
                        plugins: [amplitude, googleAnalytics]
                    })];
                case 1:
                    ajs = (_a.sent())[0];
                    segmentio = ajs.queue.plugins.find(function (p) { return p.name === 'Segment.io'; });
                    expect(segmentio).toBeDefined();
                    ampSpy = jest.spyOn(amplitude, 'track');
                    gaSpy = jest.spyOn(googleAnalytics, 'track');
                    segmentSpy = jest.spyOn(segmentio, 'track');
                    return [4 /*yield*/, ajs.track('Boo!', {
                            total: 25,
                            userId: '👻'
                        })];
                case 2:
                    boo = _a.sent();
                    expect(ampSpy).toHaveBeenCalledWith(boo);
                    expect(gaSpy).toHaveBeenCalledWith(boo);
                    expect(segmentSpy).toHaveBeenCalledWith(boo);
                    return [2 /*return*/];
            }
        });
    }); });
    it('does not dispatch events to destinations on deny list', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var ajs, segmentio, ampSpy, gaSpy, segmentSpy, boo;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({
                        writeKey: writeKey,
                        plugins: [amplitude, googleAnalytics]
                    })];
                case 1:
                    ajs = (_a.sent())[0];
                    segmentio = ajs.queue.plugins.find(function (p) { return p.name === 'Segment.io'; });
                    expect(segmentio).toBeDefined();
                    ampSpy = jest.spyOn(amplitude, 'track');
                    gaSpy = jest.spyOn(googleAnalytics, 'track');
                    segmentSpy = jest.spyOn(segmentio, 'track');
                    return [4 /*yield*/, ajs.track('Boo!', {
                            total: 25,
                            userId: '👻'
                        }, {
                            integrations: {
                                Amplitude: false,
                                'Segment.io': false
                            }
                        })];
                case 2:
                    boo = _a.sent();
                    expect(gaSpy).toHaveBeenCalledWith(boo);
                    expect(ampSpy).not.toHaveBeenCalled();
                    expect(segmentSpy).not.toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    it('does dispatch events to Segment.io when All is false', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var ajs, segmentio, ampSpy, gaSpy, segmentSpy, boo;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({
                        writeKey: writeKey,
                        plugins: [amplitude, googleAnalytics]
                    })];
                case 1:
                    ajs = (_a.sent())[0];
                    segmentio = ajs.queue.plugins.find(function (p) { return p.name === 'Segment.io'; });
                    expect(segmentio).toBeDefined();
                    ampSpy = jest.spyOn(amplitude, 'track');
                    gaSpy = jest.spyOn(googleAnalytics, 'track');
                    segmentSpy = jest.spyOn(segmentio, 'track');
                    return [4 /*yield*/, ajs.track('Boo!', {
                            total: 25,
                            userId: '👻'
                        }, {
                            integrations: {
                                All: false
                            }
                        })];
                case 2:
                    boo = _a.sent();
                    expect(gaSpy).not.toHaveBeenCalled();
                    expect(ampSpy).not.toHaveBeenCalled();
                    expect(segmentSpy).toHaveBeenCalledWith(boo);
                    return [2 /*return*/];
            }
        });
    }); });
    it('enriches events before dispatching', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var ajs, boo;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({
                        writeKey: writeKey,
                        plugins: [enrichBilling, amplitude, googleAnalytics]
                    })];
                case 1:
                    ajs = (_a.sent())[0];
                    return [4 /*yield*/, ajs.track('Boo!', {
                            total: 25
                        })];
                case 2:
                    boo = _a.sent();
                    expect(boo.event.properties).toMatchInlineSnapshot("\n      Object {\n        \"billingPlan\": \"free-99\",\n        \"total\": 25,\n      }\n    ");
                    return [2 /*return*/];
            }
        });
    }); });
    it('collects metrics for every event', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var ajs, delivered, metrics;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({
                        writeKey: writeKey,
                        plugins: [amplitude]
                    })];
                case 1:
                    ajs = (_a.sent())[0];
                    return [4 /*yield*/, ajs.track('Fruit Basket', {
                            items: ['🍌', '🍇', '🍎'],
                            userId: 'Healthy person'
                        })];
                case 2:
                    delivered = _a.sent();
                    metrics = delivered.stats.metrics;
                    expect(metrics.map(function (m) { return m.metric; })).toMatchInlineSnapshot("\n      Array [\n        \"message_dispatched\",\n        \"plugin_time\",\n        \"plugin_time\",\n        \"plugin_time\",\n        \"message_delivered\",\n        \"plugin_time\",\n        \"delivered\",\n      ]\n    ");
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('Group', function () {
    it('manages Group state', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var analytics, group, ctx;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({
                        writeKey: writeKey
                    })];
                case 1:
                    analytics = (_a.sent())[0];
                    group = analytics.group();
                    return [4 /*yield*/, analytics.group('coolKids', {
                            coolKids: true
                        })];
                case 2:
                    ctx = _a.sent();
                    expect(ctx.event.groupId).toEqual('coolKids');
                    expect(ctx.event.traits).toEqual({ coolKids: true });
                    expect(group.id()).toEqual('coolKids');
                    expect(group.traits()).toEqual({ coolKids: true });
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('Alias', function () {
    it('generates alias events', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var analytics, ctx;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({
                        writeKey: writeKey,
                        plugins: [amplitude]
                    })];
                case 1:
                    analytics = (_a.sent())[0];
                    jest.spyOn(amplitude, 'alias');
                    return [4 /*yield*/, analytics.alias('netto farah', 'netto')];
                case 2:
                    ctx = _a.sent();
                    expect(ctx.event.userId).toEqual('netto farah');
                    expect(ctx.event.previousId).toEqual('netto');
                    expect(amplitude.alias).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    it('falls back to userID in cookies if no id passed', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var analytics, ctx;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    js_cookie_1["default"].set('ajs_user_id', 'dan');
                    return [4 /*yield*/, __1.AnalyticsBrowser.load({
                            writeKey: writeKey,
                            plugins: [amplitude]
                        })];
                case 1:
                    analytics = (_a.sent())[0];
                    jest.spyOn(amplitude, 'alias');
                    return [4 /*yield*/, analytics.alias()];
                case 2:
                    ctx = _a.sent();
                    expect(ctx.event.userId).toEqual('dan');
                    expect(amplitude.alias).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('pageview', function () {
    it('makes a page call with the given url', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var analytics, mockPage;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.warn = function () { };
                    analytics = new analytics_1.Analytics({ writeKey: writeKey });
                    mockPage = jest.spyOn(analytics, 'page');
                    return [4 /*yield*/, analytics.pageview('www.foo.com')];
                case 1:
                    _a.sent();
                    expect(mockPage).toHaveBeenCalledWith({ path: 'www.foo.com' });
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('setAnonymousId', function () {
    beforeEach(function () {
        browser_storage_1.clearAjsBrowserStorage();
    });
    it('calling setAnonymousId will set a new anonymousId and returns it', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var analytics, currentAnonymousId, newAnonymousId;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({
                        writeKey: writeKey,
                        plugins: [amplitude]
                    })];
                case 1:
                    analytics = (_a.sent())[0];
                    currentAnonymousId = analytics.user().anonymousId();
                    expect(currentAnonymousId).toBeDefined();
                    expect(currentAnonymousId).toHaveLength(36);
                    newAnonymousId = analytics.setAnonymousId('🦹‍♀️');
                    expect(analytics.user().anonymousId()).toEqual('🦹‍♀️');
                    expect(newAnonymousId).toEqual('🦹‍♀️');
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('addSourceMiddleware', function () {
    it('supports registering source middlewares', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var analytics, ctx;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({
                        writeKey: writeKey
                    })];
                case 1:
                    analytics = (_a.sent())[0];
                    return [4 /*yield*/, analytics
                            .addSourceMiddleware(function (_a) {
                            var next = _a.next, payload = _a.payload;
                            payload.obj.context = {
                                hello: 'from the other side'
                            };
                            next(payload);
                        })["catch"](function (err) {
                            throw err;
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, analytics.track('Hello!')];
                case 3:
                    ctx = _a.sent();
                    expect(ctx.event.context).toMatchObject({
                        hello: 'from the other side'
                    });
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('addDestinationMiddleware', function () {
    beforeEach(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var html, jsd, windowSpy;
        return tslib_1.__generator(this, function (_a) {
            jest.restoreAllMocks();
            jest.resetAllMocks();
            html = "\n    <!DOCTYPE html>\n      <head>\n        <script>'hi'</script>\n      </head>\n      <body>\n      </body>\n    </html>\n    ".trim();
            jsd = new jsdom_1.JSDOM(html, {
                runScripts: 'dangerously',
                resources: 'usable',
                url: 'https://localhost'
            });
            windowSpy = jest.spyOn(global, 'window', 'get');
            windowSpy.mockImplementation(function () { return jsd.window; });
            return [2 /*return*/];
        });
    }); });
    it('supports registering destination middlewares', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var analytics, amplitude, integrationMock, ctx, calledWith;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({
                        writeKey: writeKey
                    })];
                case 1:
                    analytics = (_a.sent())[0];
                    amplitude = new ajs_destination_1.LegacyDestination('amplitude', 'latest', {
                        apiKey: amplitudeWriteKey
                    }, {});
                    return [4 /*yield*/, analytics.register(amplitude)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, amplitude.ready()];
                case 3:
                    _a.sent();
                    analytics
                        .addDestinationMiddleware('amplitude', function (_a) {
                        var next = _a.next, payload = _a.payload;
                        payload.obj.properties.hello = 'from the other side';
                        next(payload);
                    })["catch"](function (err) {
                        throw err;
                    });
                    integrationMock = jest.spyOn(amplitude.integration, 'track');
                    return [4 /*yield*/, analytics.track('Hello!')
                        // does not modify the event
                    ];
                case 4:
                    ctx = _a.sent();
                    // does not modify the event
                    expect(ctx.event.properties).not.toEqual({
                        hello: 'from the other side'
                    });
                    calledWith = integrationMock.mock.calls[0][0].properties();
                    // only impacted this destination
                    expect(calledWith).toEqual(tslib_1.__assign(tslib_1.__assign({}, ctx.event.properties), { hello: 'from the other side' }));
                    return [2 /*return*/];
            }
        });
    }); });
    it('supports registering action destination middlewares', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var testPlugin, analytics, fullstory;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testPlugin = {
                        name: 'test',
                        type: 'destination',
                        version: '0.1.0',
                        load: function () { return Promise.resolve(); },
                        isLoaded: function () { return true; }
                    };
                    return [4 /*yield*/, __1.AnalyticsBrowser.load({
                            writeKey: writeKey
                        })];
                case 1:
                    analytics = (_a.sent())[0];
                    fullstory = new remote_loader_1.ActionDestination('fullstory', testPlugin);
                    return [4 /*yield*/, analytics.register(fullstory)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, fullstory.ready()];
                case 3:
                    _a.sent();
                    analytics
                        .addDestinationMiddleware('fullstory', function (_a) {
                        var next = _a.next, payload = _a.payload;
                        return next(payload);
                    })["catch"](function (err) {
                        throw err;
                    });
                    expect(analytics.queue.plugins).toContain(fullstory);
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('use', function () {
    it('registers a legacyPlugin', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var analytics, legacyPlugin;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({
                        writeKey: writeKey
                    })];
                case 1:
                    analytics = (_a.sent())[0];
                    legacyPlugin = jest.fn();
                    analytics.use(legacyPlugin);
                    expect(legacyPlugin).toHaveBeenCalledWith(analytics);
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('timeout', function () {
    it('has a default timeout value', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var analytics;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({
                        writeKey: writeKey
                    })
                    //@ts-ignore
                ];
                case 1:
                    analytics = (_a.sent())[0];
                    //@ts-ignore
                    expect(analytics.settings.timeout).toEqual(300);
                    return [2 /*return*/];
            }
        });
    }); });
    it('can set a timeout value', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var analytics;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({
                        writeKey: writeKey
                    })];
                case 1:
                    analytics = (_a.sent())[0];
                    analytics.timeout(50);
                    //@ts-ignore
                    expect(analytics.settings.timeout).toEqual(50);
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('deregister', function () {
    beforeEach(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var html, jsd, windowSpy;
        return tslib_1.__generator(this, function (_a) {
            jest.restoreAllMocks();
            jest.resetAllMocks();
            html = "\n    <!DOCTYPE html>\n      <head>\n        <script>'hi'</script>\n      </head>\n      <body>\n      </body>\n    </html>\n    ".trim();
            jsd = new jsdom_1.JSDOM(html, {
                runScripts: 'dangerously',
                resources: 'usable',
                url: 'https://localhost'
            });
            windowSpy = jest.spyOn(global, 'window', 'get');
            windowSpy.mockImplementation(function () { return jsd.window; });
            return [2 /*return*/];
        });
    }); });
    it('deregisters a plugin given its name', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var unload, analytics;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    unload = jest.fn(function () {
                        return Promise.resolve();
                    });
                    xt.unload = unload;
                    return [4 /*yield*/, __1.AnalyticsBrowser.load({
                            writeKey: writeKey,
                            plugins: [xt]
                        })];
                case 1:
                    analytics = (_a.sent())[0];
                    return [4 /*yield*/, analytics.deregister('Test Plugin')];
                case 2:
                    _a.sent();
                    expect(xt.unload).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    it('cleans up the DOM when deregistering a legacy integration', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var amplitude, analytics, scriptsLength;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    amplitude = new ajs_destination_1.LegacyDestination('amplitude', 'latest', {
                        apiKey: amplitudeWriteKey
                    }, {});
                    return [4 /*yield*/, __1.AnalyticsBrowser.load({
                            writeKey: writeKey,
                            plugins: [amplitude]
                        })];
                case 1:
                    analytics = (_a.sent())[0];
                    return [4 /*yield*/, analytics.ready()];
                case 2:
                    _a.sent();
                    scriptsLength = window.document.scripts.length;
                    expect(scriptsLength).toBeGreaterThan(1);
                    return [4 /*yield*/, analytics.deregister('amplitude')];
                case 3:
                    _a.sent();
                    expect(window.document.scripts.length).toBe(scriptsLength - 1);
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('retries', function () {
    var testPlugin = {
        name: 'test',
        type: 'before',
        version: '0.1.0',
        load: function () { return Promise.resolve(); },
        isLoaded: function () { return true; }
    };
    var fruitBasketEvent = new context_1.Context({
        type: 'track',
        event: 'Fruit Basket'
    });
    beforeEach(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            // @ts-ignore ignore reassining function
            __1.loadLegacySettings = jest.fn().mockReturnValue(Promise.resolve({
                integrations: { 'Segment.io': { retryQueue: false } }
            }));
            return [2 /*return*/];
        });
    }); });
    it('does not retry errored events if retryQueue setting is set to false', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var ajs, flushed;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({ writeKey: writeKey }, { retryQueue: false })];
                case 1:
                    ajs = (_a.sent())[0];
                    expect(ajs.queue.queue instanceof persisted_1.PersistedPriorityQueue).toBeTruthy();
                    expect(ajs.queue.queue.maxAttempts).toBe(1);
                    return [4 /*yield*/, ajs.queue.register(context_1.Context.system(), tslib_1.__assign(tslib_1.__assign({}, testPlugin), { track: function (_ctx) {
                                throw new Error('aaay');
                            } }), ajs)
                        // Dispatching an event will push it into the priority queue.
                    ];
                case 2:
                    _a.sent();
                    // Dispatching an event will push it into the priority queue.
                    return [4 /*yield*/, ajs.queue.dispatch(fruitBasketEvent)["catch"](function () { })
                        // we make sure the queue is flushed and there are no events queued up.
                    ];
                case 3:
                    // Dispatching an event will push it into the priority queue.
                    _a.sent();
                    // we make sure the queue is flushed and there are no events queued up.
                    expect(ajs.queue.queue.length).toBe(0);
                    return [4 /*yield*/, ajs.queue.flush()];
                case 4:
                    flushed = _a.sent();
                    expect(flushed).toStrictEqual([]);
                    // as maxAttempts === 1, only one attempt was made.
                    // getAttempts(fruitBasketEvent) === 2 means the event's attemp was incremented,
                    // but the condition "(getAttempts(event) > maxAttempts) { return false }"
                    // aborted the retry
                    expect(ajs.queue.queue.getAttempts(fruitBasketEvent)).toEqual(2);
                    return [2 /*return*/];
            }
        });
    }); });
    it('does not queue events / dispatch when offline if retryQueue setting is set to false', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var ajs, trackSpy;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({ writeKey: writeKey }, { retryQueue: false })];
                case 1:
                    ajs = (_a.sent())[0];
                    trackSpy = jest.fn().mockImplementation(function (ctx) { return ctx; });
                    return [4 /*yield*/, ajs.queue.register(context_1.Context.system(), tslib_1.__assign(tslib_1.__assign({}, testPlugin), { ready: function () { return Promise.resolve(true); }, track: trackSpy }), ajs)
                        // @ts-ignore ignore reassining function
                    ];
                case 2:
                    _a.sent();
                    // @ts-ignore ignore reassining function
                    connection_1.isOffline = jest.fn().mockReturnValue(true);
                    return [4 /*yield*/, ajs.track('event')];
                case 3:
                    _a.sent();
                    expect(trackSpy).toBeCalledTimes(0);
                    return [2 /*return*/];
            }
        });
    }); });
    it('enqueues events / dispatches if the client is currently offline and retries are *enabled* for the main event queue', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var ajs, trackSpy;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({ writeKey: writeKey }, { retryQueue: true })];
                case 1:
                    ajs = (_a.sent())[0];
                    trackSpy = jest.fn().mockImplementation(function (ctx) { return ctx; });
                    return [4 /*yield*/, ajs.queue.register(context_1.Context.system(), tslib_1.__assign(tslib_1.__assign({}, testPlugin), { ready: function () { return Promise.resolve(true); }, track: trackSpy }), ajs)
                        // @ts-ignore ignore reassining function
                    ];
                case 2:
                    _a.sent();
                    // @ts-ignore ignore reassining function
                    connection_1.isOffline = jest.fn().mockReturnValue(true);
                    expect(trackSpy).toBeCalledTimes(0);
                    return [4 /*yield*/, ajs.track('event')];
                case 3:
                    _a.sent();
                    expect(trackSpy).toBeCalledTimes(1);
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('Segment.io overrides', function () {
    it('allows for overriding Segment.io settings', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jest.spyOn(SegmentPlugin, 'segmentio');
                    return [4 /*yield*/, __1.AnalyticsBrowser.load({ writeKey: writeKey }, {
                            integrations: {
                                'Segment.io': {
                                    apiHost: 'https://my.endpoint.com',
                                    anotherSettings: '👻'
                                }
                            }
                        })];
                case 1:
                    _a.sent();
                    expect(SegmentPlugin.segmentio).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
                        apiHost: 'https://my.endpoint.com',
                        anotherSettings: '👻'
                    }), expect.anything());
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('Options', function () {
    beforeEach(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var html, jsd, windowSpy;
        return tslib_1.__generator(this, function (_a) {
            jest.restoreAllMocks();
            jest.resetAllMocks();
            html = "\n    <!DOCTYPE html>\n      <head>\n        <script>'hi'</script>\n      </head>\n      <body>\n      </body>\n    </html>\n    ".trim();
            jsd = new jsdom_1.JSDOM(html, {
                runScripts: 'dangerously',
                resources: 'usable',
                url: 'https://localhost'
            });
            windowSpy = jest.spyOn(global, 'window', 'get');
            windowSpy.mockImplementation(function () { return jsd.window; });
            return [2 /*return*/];
        });
    }); });
    describe('disableAutoISOConversion', function () {
        it('converts iso strings to dates be default', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var analytics, amplitude, integrationMock, integrationEvent;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, __1.AnalyticsBrowser.load({
                            writeKey: writeKey
                        })];
                    case 1:
                        analytics = (_a.sent())[0];
                        amplitude = new ajs_destination_1.LegacyDestination('amplitude', 'latest', {
                            apiKey: amplitudeWriteKey
                        }, {});
                        return [4 /*yield*/, analytics.register(amplitude)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, amplitude.ready()];
                    case 3:
                        _a.sent();
                        integrationMock = jest.spyOn(amplitude.integration, 'track');
                        return [4 /*yield*/, analytics.track('Hello!', {
                                date: new Date(),
                                iso: '2020-10-10'
                            })];
                    case 4:
                        _a.sent();
                        integrationEvent = integrationMock.mock.lastCall[0];
                        expect(integrationEvent.properties()).toEqual({
                            date: expect.any(Date),
                            iso: expect.any(Date)
                        });
                        expect(integrationEvent.timestamp()).toBeInstanceOf(Date);
                        return [2 /*return*/];
                }
            });
        }); });
        it('converts iso strings to dates be default', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var initOptions, analytics, amplitude, integrationMock, integrationEvent;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        initOptions = { disableAutoISOConversion: false };
                        return [4 /*yield*/, __1.AnalyticsBrowser.load({
                                writeKey: writeKey
                            }, initOptions)];
                    case 1:
                        analytics = (_a.sent())[0];
                        amplitude = new ajs_destination_1.LegacyDestination('amplitude', 'latest', {
                            apiKey: amplitudeWriteKey
                        }, initOptions);
                        return [4 /*yield*/, analytics.register(amplitude)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, amplitude.ready()];
                    case 3:
                        _a.sent();
                        integrationMock = jest.spyOn(amplitude.integration, 'track');
                        return [4 /*yield*/, analytics.track('Hello!', {
                                date: new Date(),
                                iso: '2020-10-10'
                            })];
                    case 4:
                        _a.sent();
                        integrationEvent = integrationMock.mock.lastCall[0];
                        expect(integrationEvent.properties()).toEqual({
                            date: expect.any(Date),
                            iso: expect.any(Date)
                        });
                        expect(integrationEvent.timestamp()).toBeInstanceOf(Date);
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not convert iso strings to dates when `true`', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var initOptions, analytics, amplitude, integrationMock, integrationEvent;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        initOptions = { disableAutoISOConversion: true };
                        return [4 /*yield*/, __1.AnalyticsBrowser.load({
                                writeKey: writeKey
                            }, initOptions)];
                    case 1:
                        analytics = (_a.sent())[0];
                        amplitude = new ajs_destination_1.LegacyDestination('amplitude', 'latest', {
                            apiKey: amplitudeWriteKey
                        }, initOptions);
                        return [4 /*yield*/, analytics.register(amplitude)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, amplitude.ready()];
                    case 3:
                        _a.sent();
                        integrationMock = jest.spyOn(amplitude.integration, 'track');
                        return [4 /*yield*/, analytics.track('Hello!', {
                                date: new Date(),
                                iso: '2020-10-10'
                            })];
                    case 4:
                        _a.sent();
                        integrationEvent = integrationMock.mock.lastCall[0];
                        expect(integrationEvent.properties()).toEqual({
                            date: expect.any(Date),
                            iso: '2020-10-10'
                        });
                        expect(integrationEvent.timestamp()).toBeInstanceOf(Date);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=integration.test.js.map