"use strict";
exports.__esModule = true;
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
var unfetch_1 = tslib_1.__importDefault(require("unfetch"));
var __1 = require("..");
var analytics_1 = require("../../../core/analytics");
var page_enrichment_1 = require("../../page-enrichment");
var js_cookie_1 = tslib_1.__importDefault(require("js-cookie"));
jest.mock('unfetch', function () {
    return jest.fn();
});
describe('Segment.io', function () {
    var options;
    var analytics;
    var segment;
    var spyMock;
    beforeEach(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jest.resetAllMocks();
                    jest.restoreAllMocks();
                    options = { apiKey: 'foo' };
                    analytics = new analytics_1.Analytics({ writeKey: options.apiKey });
                    segment = __1.segmentio(analytics, options, {});
                    return [4 /*yield*/, analytics.register(segment, page_enrichment_1.pageEnrichment)];
                case 1:
                    _a.sent();
                    window.localStorage.clear();
                    spyMock = jest.mocked(unfetch_1["default"]).mockResolvedValue({
                        ok: true
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    function resetCookies() {
        Object.keys(js_cookie_1["default"].get()).map(function (key) { return js_cookie_1["default"].remove(key); });
    }
    afterEach(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            analytics.reset();
            resetCookies();
            window.localStorage.clear();
            return [2 /*return*/];
        });
    }); });
    describe('using a custom protocol', function () {
        it('should be able to send http requests', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var options, analytics, segment, url;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = {
                            apiKey: 'foo',
                            protocol: 'http'
                        };
                        analytics = new analytics_1.Analytics({ writeKey: options.apiKey });
                        segment = __1.segmentio(analytics, options, {});
                        return [4 /*yield*/, analytics.register(segment, page_enrichment_1.pageEnrichment)
                            // @ts-ignore test a valid ajsc page call
                        ];
                    case 1:
                        _a.sent();
                        // @ts-ignore test a valid ajsc page call
                        return [4 /*yield*/, analytics.page(null, { foo: 'bar' })];
                    case 2:
                        // @ts-ignore test a valid ajsc page call
                        _a.sent();
                        url = spyMock.mock.calls[0][0];
                        expect(url).toMatchInlineSnapshot("\"http://api.segment.io/v1/p\"");
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#page', function () {
        it('should enqueue section, name and properties', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var _a, url, params, body;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, analytics.page('section', 'name', { property: true }, { opt: true })];
                    case 1:
                        _b.sent();
                        _a = spyMock.mock.calls[0], url = _a[0], params = _a[1];
                        expect(url).toMatchInlineSnapshot("\"https://api.segment.io/v1/p\"");
                        body = JSON.parse(params.body);
                        assert_1["default"](body.name === 'name');
                        assert_1["default"](body.category === 'section');
                        assert_1["default"](body.properties.property === true);
                        assert_1["default"](body.context.opt === true);
                        assert_1["default"](body.timestamp);
                        return [2 /*return*/];
                }
            });
        }); });
        it('sets properties when name and category are null', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var _a, url, params, body;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: 
                    // @ts-ignore test a valid ajsc page call
                    return [4 /*yield*/, analytics.page(null, { foo: 'bar' })];
                    case 1:
                        // @ts-ignore test a valid ajsc page call
                        _b.sent();
                        _a = spyMock.mock.calls[0], url = _a[0], params = _a[1];
                        expect(url).toMatchInlineSnapshot("\"https://api.segment.io/v1/p\"");
                        body = JSON.parse(params.body);
                        assert_1["default"](body.properties.foo === 'bar');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#identify', function () {
        it('should enqueue an id and traits', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var _a, url, params, body;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, analytics.identify('id', { trait: true }, { opt: true })];
                    case 1:
                        _b.sent();
                        _a = spyMock.mock.calls[0], url = _a[0], params = _a[1];
                        expect(url).toMatchInlineSnapshot("\"https://api.segment.io/v1/i\"");
                        body = JSON.parse(params.body);
                        assert_1["default"](body.userId === 'id');
                        assert_1["default"](body.traits.trait === true);
                        assert_1["default"](body.context.opt === true);
                        assert_1["default"](body.timestamp);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should set traits with null id', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var _a, url, params, body;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, analytics.identify(null, { trait: true }, { opt: true })];
                    case 1:
                        _b.sent();
                        _a = spyMock.mock.calls[0], url = _a[0], params = _a[1];
                        expect(url).toMatchInlineSnapshot("\"https://api.segment.io/v1/i\"");
                        body = JSON.parse(params.body);
                        assert_1["default"](body.userId === null);
                        assert_1["default"](body.traits.trait === true);
                        assert_1["default"](!body.context.trait);
                        assert_1["default"](body.context.opt === true);
                        assert_1["default"](body.timestamp);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#track', function () {
        it('should enqueue an event and properties', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var _a, url, params, body;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, analytics.track('event', { prop: true }, { opt: true })];
                    case 1:
                        _b.sent();
                        _a = spyMock.mock.calls[0], url = _a[0], params = _a[1];
                        expect(url).toMatchInlineSnapshot("\"https://api.segment.io/v1/t\"");
                        body = JSON.parse(params.body);
                        assert_1["default"](body.event === 'event');
                        assert_1["default"](body.context.opt === true);
                        assert_1["default"](body.properties.prop === true);
                        assert_1["default"](body.traits == null);
                        assert_1["default"](body.timestamp);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#group', function () {
        it('should enqueue groupId and traits', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var _a, url, params, body;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, analytics.group('id', { trait: true }, { opt: true })];
                    case 1:
                        _b.sent();
                        _a = spyMock.mock.calls[0], url = _a[0], params = _a[1];
                        expect(url).toMatchInlineSnapshot("\"https://api.segment.io/v1/g\"");
                        body = JSON.parse(params.body);
                        assert_1["default"](body.groupId === 'id');
                        assert_1["default"](body.context.opt === true);
                        assert_1["default"](body.traits.trait === true);
                        assert_1["default"](body.timestamp);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should set traits with null id', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var _a, url, params, body;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, analytics.group(null, { trait: true }, { opt: true })];
                    case 1:
                        _b.sent();
                        _a = spyMock.mock.calls[0], url = _a[0], params = _a[1];
                        expect(url).toMatchInlineSnapshot("\"https://api.segment.io/v1/g\"");
                        body = JSON.parse(params.body);
                        assert_1["default"](body.groupId === null);
                        assert_1["default"](body.context.opt === true);
                        assert_1["default"](body.traits.trait === true);
                        assert_1["default"](!body.context.trait);
                        assert_1["default"](body.timestamp);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#alias', function () {
        it('should enqueue .userId and .previousId', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var _a, url, params, body;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, analytics.alias('to', 'from')];
                    case 1:
                        _b.sent();
                        _a = spyMock.mock.calls[0], url = _a[0], params = _a[1];
                        expect(url).toMatchInlineSnapshot("\"https://api.segment.io/v1/a\"");
                        body = JSON.parse(params.body);
                        assert_1["default"](body.previousId === 'from');
                        assert_1["default"](body.userId === 'to');
                        assert_1["default"](body.timestamp);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should fallback to user.anonymousId if .previousId is omitted', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var _a, url, params, body;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        analytics.user().anonymousId('anon-id');
                        return [4 /*yield*/, analytics.alias('to')];
                    case 1:
                        _b.sent();
                        _a = spyMock.mock.calls[0], url = _a[0], params = _a[1];
                        expect(url).toMatchInlineSnapshot("\"https://api.segment.io/v1/a\"");
                        body = JSON.parse(params.body);
                        assert_1["default"](body.previousId === 'anon-id');
                        assert_1["default"](body.userId === 'to');
                        assert_1["default"](body.timestamp);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should fallback to user.anonymousId if .previousId and user.id are falsey', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var _a, url, params, body;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, analytics.alias('to')];
                    case 1:
                        _b.sent();
                        _a = spyMock.mock.calls[0], url = _a[0], params = _a[1];
                        expect(url).toMatchInlineSnapshot("\"https://api.segment.io/v1/a\"");
                        body = JSON.parse(params.body);
                        assert_1["default"](body.previousId);
                        assert_1["default"](body.previousId.length === 36);
                        assert_1["default"](body.userId === 'to');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should rename `.from` and `.to` to `.previousId` and `.userId`', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var _a, url, params, body;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, analytics.alias('user-id', 'previous-id')];
                    case 1:
                        _b.sent();
                        _a = spyMock.mock.calls[0], url = _a[0], params = _a[1];
                        expect(url).toMatchInlineSnapshot("\"https://api.segment.io/v1/a\"");
                        body = JSON.parse(params.body);
                        assert_1["default"](body.previousId === 'previous-id');
                        assert_1["default"](body.userId === 'user-id');
                        assert_1["default"](body.from == null);
                        assert_1["default"](body.to == null);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=index.test.js.map