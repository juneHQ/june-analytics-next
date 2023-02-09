"use strict";
exports.__esModule = true;
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
var js_cookie_1 = tslib_1.__importDefault(require("js-cookie"));
var normalize_1 = require("../normalize");
var analytics_1 = require("../../../core/analytics");
var jsdom_1 = require("jsdom");
var version_1 = require("../../../generated/version");
describe('before loading', function () {
    var jsdom;
    beforeEach(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var html, windowSpy;
        return tslib_1.__generator(this, function (_a) {
            jest.restoreAllMocks();
            jest.resetAllMocks();
            html = "\n    <!DOCTYPE html>\n      <head></head>\n      <body></body>\n    </html>\n    ".trim();
            jsdom = new jsdom_1.JSDOM(html, {
                runScripts: 'dangerously',
                resources: 'usable',
                url: 'https://localhost'
            });
            windowSpy = jest.spyOn(global, 'window', 'get');
            windowSpy.mockImplementation(function () { return jsdom.window; });
            return [2 /*return*/];
        });
    }); });
    var options;
    var analytics;
    beforeEach(function () {
        options = { apiKey: 'foo' };
        analytics = new analytics_1.Analytics({ writeKey: options.apiKey });
        window.localStorage.clear();
    });
    afterEach(function () {
        analytics.reset();
        Object.keys(js_cookie_1["default"].get()).map(function (k) { return js_cookie_1["default"].remove(k); });
        if (window.localStorage) {
            window.localStorage.clear();
        }
    });
    describe('#normalize', function () {
        var object;
        beforeEach(function () {
            js_cookie_1["default"].remove('s:context.referrer');
            object = {
                type: 'track'
            };
        });
        it('should add .anonymousId', function () {
            analytics.user().anonymousId('anon-id');
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](object.anonymousId === 'anon-id');
        });
        it('should add .sentAt', function () {
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](object.sentAt);
            // assert(type(object.sentAt) === 'date')
        });
        it('should add .userId', function () {
            analytics.user().id('user-id');
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](object.userId === 'user-id');
        });
        it('should not replace the .timestamp', function () {
            var timestamp = new Date();
            object.timestamp = timestamp;
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](object.timestamp === timestamp);
        });
        it('should not replace the .userId', function () {
            analytics.user().id('user-id');
            object.userId = 'existing-id';
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](object.userId === 'existing-id');
        });
        it('should always add .anonymousId even if .userId is given', function () {
            var _a;
            var object = { userId: 'baz', type: 'track' };
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](((_a = object.anonymousId) === null || _a === void 0 ? void 0 : _a.length) === 36);
        });
        it('should accept anonymousId being set in an event', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var object;
            return tslib_1.__generator(this, function (_a) {
                object = {
                    userId: 'baz',
                    type: 'track',
                    anonymousId: '👻'
                };
                normalize_1.normalize(analytics, object, options, {});
                expect(object.anonymousId).toEqual('👻');
                return [2 /*return*/];
            });
        }); });
        it('should add .context', function () {
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](object.context);
        });
        it('should not rewrite context if provided', function () {
            var ctx = {};
            var obj = tslib_1.__assign(tslib_1.__assign({}, object), { context: ctx });
            normalize_1.normalize(analytics, obj, options, {});
            expect(obj.context).toEqual(ctx);
        });
        it('should copy .options to .context', function () {
            var opts = {};
            var obj = tslib_1.__assign(tslib_1.__assign({}, object), { options: opts });
            normalize_1.normalize(analytics, obj, options, {});
            assert_1["default"](obj.context === opts);
            assert_1["default"](obj.options == null);
        });
        it('should add .writeKey', function () {
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](object.writeKey === options.apiKey);
        });
        it('should add .library', function () {
            var _a, _b, _c;
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"]((_a = object.context) === null || _a === void 0 ? void 0 : _a.library);
            assert_1["default"](((_b = object.context) === null || _b === void 0 ? void 0 : _b.library.name) === 'analytics.js');
            assert_1["default"](((_c = object.context) === null || _c === void 0 ? void 0 : _c.library.version) === "npm:next-" + version_1.version);
        });
        it('should allow override of .library', function () {
            var _a, _b, _c;
            var ctx = {
                library: {
                    name: 'analytics-wordpress',
                    version: '1.0.3'
                }
            };
            var obj = tslib_1.__assign(tslib_1.__assign({}, object), { context: ctx });
            normalize_1.normalize(analytics, obj, options, {});
            assert_1["default"]((_a = obj.context) === null || _a === void 0 ? void 0 : _a.library);
            assert_1["default"](((_b = obj.context) === null || _b === void 0 ? void 0 : _b.library.name) === 'analytics-wordpress');
            assert_1["default"](((_c = obj.context) === null || _c === void 0 ? void 0 : _c.library.version) === '1.0.3');
        });
        it('should add .userAgent', function () {
            var _a;
            normalize_1.normalize(analytics, object, options, {});
            var removeVersionNum = function (agent) { return agent.replace(/jsdom\/.*/, ''); };
            var userAgent1 = removeVersionNum((_a = object.context) === null || _a === void 0 ? void 0 : _a.userAgent);
            var userAgent2 = removeVersionNum(navigator.userAgent);
            assert_1["default"](userAgent1 === userAgent2);
        });
        it('should add .locale', function () {
            var _a;
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](((_a = object.context) === null || _a === void 0 ? void 0 : _a.locale) === navigator.language);
        });
        it('should not replace .locale if provided', function () {
            var _a;
            var ctx = {
                locale: 'foobar'
            };
            var obj = tslib_1.__assign(tslib_1.__assign({}, object), { context: ctx });
            normalize_1.normalize(analytics, obj, options, {});
            assert_1["default"](((_a = obj.context) === null || _a === void 0 ? void 0 : _a.locale) === 'foobar');
        });
        it('should add .campaign', function () {
            jsdom.reconfigure({
                url: 'http://localhost?utm_source=source&utm_medium=medium&utm_term=term&utm_content=content&utm_campaign=name'
            });
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](object);
            assert_1["default"](object.context);
            assert_1["default"](object.context.campaign);
            assert_1["default"](object.context.campaign.source === 'source');
            assert_1["default"](object.context.campaign.medium === 'medium');
            assert_1["default"](object.context.campaign.term === 'term');
            assert_1["default"](object.context.campaign.content === 'content');
            assert_1["default"](object.context.campaign.name === 'name');
        });
        it('should decode query params', function () {
            jsdom.reconfigure({
                url: 'http://localhost?utm_source=%5BFoo%5D'
            });
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](object);
            assert_1["default"](object.context);
            assert_1["default"](object.context.campaign);
            assert_1["default"](object.context.campaign.source === '[Foo]');
        });
        it('should guard against undefined utm params', function () {
            jsdom.reconfigure({
                url: 'http://localhost?utm_source'
            });
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](object);
            assert_1["default"](object.context);
            assert_1["default"](object.context.campaign);
            assert_1["default"](object.context.campaign.source === '');
        });
        it('should guard against empty utm params', function () {
            jsdom.reconfigure({
                url: 'http://localhost?utm_source='
            });
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](object);
            assert_1["default"](object.context);
            assert_1["default"](object.context.campaign);
            assert_1["default"](object.context.campaign.source === '');
        });
        it('only parses utm params suffixed with _', function () {
            jsdom.reconfigure({
                url: 'http://localhost?utm'
            });
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](object);
            assert_1["default"](object.context);
            assert_1["default"].deepStrictEqual(object.context.campaign, {});
        });
        it('should guard against short utm params', function () {
            jsdom.reconfigure({
                url: 'http://localhost?utm_'
            });
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](object);
            assert_1["default"](object.context);
            assert_1["default"].deepStrictEqual(object.context.campaign, {});
        });
        it('should allow override of .campaign', function () {
            jsdom.reconfigure({
                url: 'http://localhost?utm_source=source&utm_medium=medium&utm_term=term&utm_content=content&utm_campaign=name'
            });
            var obj = tslib_1.__assign(tslib_1.__assign({}, object), { context: {
                    campaign: {
                        source: 'overrideSource',
                        medium: 'overrideMedium',
                        term: 'overrideTerm',
                        content: 'overrideContent',
                        name: 'overrideName'
                    }
                } });
            normalize_1.normalize(analytics, obj, options, {});
            assert_1["default"](obj);
            assert_1["default"](obj.context);
            assert_1["default"](obj.context.campaign);
            assert_1["default"](obj.context.campaign.source === 'overrideSource');
            assert_1["default"](obj.context.campaign.medium === 'overrideMedium');
            assert_1["default"](obj.context.campaign.term === 'overrideTerm');
            assert_1["default"](obj.context.campaign.content === 'overrideContent');
            assert_1["default"](obj.context.campaign.name === 'overrideName');
        });
        it('should add .referrer.id and .referrer.type (cookies)', function () {
            jsdom.reconfigure({
                url: 'http://localhost?utm_source=source&urid=medium'
            });
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](object);
            assert_1["default"](object.context);
            assert_1["default"](object.context.referrer);
            expect(object.context.referrer.id).toBe('medium');
            assert_1["default"](object.context.referrer.type === 'millennial-media');
            expect(js_cookie_1["default"].get('s:context.referrer')).toEqual(JSON.stringify({
                id: 'medium',
                type: 'millennial-media'
            }));
        });
        it('should add .referrer.id and .referrer.type (cookieless)', function () {
            jsdom.reconfigure({
                url: 'http://localhost?utm_source=source&urid=medium'
            });
            var setCookieSpy = jest.spyOn(js_cookie_1["default"], 'set');
            analytics = new analytics_1.Analytics({ writeKey: options.apiKey }, { disableClientPersistence: true });
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](object);
            assert_1["default"](object.context);
            assert_1["default"](object.context.referrer);
            expect(object.context.referrer.id).toEqual('medium');
            assert_1["default"](object.context.referrer.type === 'millennial-media');
            expect(js_cookie_1["default"].get('s:context.referrer')).toBeUndefined();
            expect(setCookieSpy).not.toHaveBeenCalled();
        });
        it('should add .referrer.id and .referrer.type from cookie', function () {
            js_cookie_1["default"].set('s:context.referrer', '{"id":"baz","type":"millennial-media"}');
            jsdom.reconfigure({
                url: 'http://localhost?utm_source=source'
            });
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](object);
            assert_1["default"](object.context);
            assert_1["default"](object.context.referrer);
            assert_1["default"](object.context.referrer.id === 'baz');
            assert_1["default"](object.context.referrer.type === 'millennial-media');
        });
        it('should add .referrer.id and .referrer.type from cookie when no query is given', function () {
            js_cookie_1["default"].set('s:context.referrer', '{"id":"medium","type":"millennial-media"}');
            jsdom.reconfigure({
                url: 'http://localhost'
            });
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](object);
            assert_1["default"](object.context);
            assert_1["default"](object.context.referrer);
            assert_1["default"](object.context.referrer.id === 'medium');
            assert_1["default"](object.context.referrer.type === 'millennial-media');
        });
        it('shouldnt add non amp ga cookie', function () {
            js_cookie_1["default"].set('_ga', 'some-nonamp-id');
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](object);
            assert_1["default"](object.context);
            assert_1["default"](!object.context.amp);
        });
        it('should add .amp.id from store', function () {
            js_cookie_1["default"].set('_ga', 'amp-foo');
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](object);
            assert_1["default"](object.context);
            assert_1["default"](object.context.amp);
            assert_1["default"](object.context.amp.id === 'amp-foo');
        });
        it('should not add .amp if theres no _ga', function () {
            js_cookie_1["default"].remove('_ga');
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"](object);
            assert_1["default"](object.context);
            assert_1["default"](!object.context.amp);
        });
        describe('failed initializations', function () {
            it.skip('should add failedInitializations as part of _metadata object if this.analytics.failedInitilizations is not empty', function () { });
        });
        describe('unbundling', function () {
            it('should add a list of bundled integrations', function () {
                normalize_1.normalize(analytics, object, options, {
                    'Segment.io': {},
                    other: {
                        bundlingStatus: 'bundled'
                    }
                });
                assert_1["default"](object);
                assert_1["default"](object._metadata);
                assert_1["default"].deepEqual(object._metadata.bundled, ['Segment.io', 'other']);
            });
            it('should add a list of bundled ids', function () {
                normalize_1.normalize(analytics, object, tslib_1.__assign(tslib_1.__assign({}, options), { maybeBundledConfigIds: {
                        other: ['o_123', 'o_456']
                    } }), {
                    'Segment.io': {},
                    other: {
                        bundlingStatus: 'bundled'
                    }
                });
                assert_1["default"](object);
                assert_1["default"](object._metadata);
                assert_1["default"].deepEqual(object._metadata.bundledIds, ['o_123', 'o_456']);
            });
            it('should add a list of unbundled integrations when `unbundledIntegrations` is set', function () {
                options.unbundledIntegrations = ['other2'];
                normalize_1.normalize(analytics, object, options, {
                    other2: {
                        bundlingStatus: 'unbundled'
                    }
                });
                assert_1["default"](object);
                assert_1["default"](object._metadata);
                assert_1["default"].deepEqual(object._metadata.unbundled, ['other2']);
            });
        });
        it('should pick up messageId from AJS', function () {
            normalize_1.normalize(analytics, object, options, {}); // ajs core generates the message ID here
            var messageId = object.messageId;
            normalize_1.normalize(analytics, object, options, {});
            assert_1["default"].equal(object.messageId, messageId);
        });
    });
});
//# sourceMappingURL=normalize.test.js.map