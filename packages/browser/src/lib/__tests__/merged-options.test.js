"use strict";
exports.__esModule = true;
var merged_options_1 = require("../merged-options");
describe(merged_options_1.mergedOptions, function () {
    it('merges options', function () {
        var merged = merged_options_1.mergedOptions({
            integrations: {
                CustomerIO: {},
                Amplitude: {
                    apiKey: '🍌'
                }
            }
        }, {
            integrations: {
                CustomerIO: {
                    ghost: '👻'
                }
            }
        });
        expect(merged).toMatchInlineSnapshot("\n      Object {\n        \"Amplitude\": Object {\n          \"apiKey\": \"\uD83C\uDF4C\",\n        },\n        \"CustomerIO\": Object {\n          \"ghost\": \"\uD83D\uDC7B\",\n        },\n      }\n    ");
    });
    it('ignores options for integrations that arent returned by CDN', function () {
        var merged = merged_options_1.mergedOptions({
            integrations: {
                Amplitude: {
                    apiKey: '🍌'
                }
            }
        }, {
            integrations: {
                // not in CDN
                CustomerIO: {
                    ghost: '👻'
                }
            }
        });
        expect(merged).toMatchInlineSnapshot("\n      Object {\n        \"Amplitude\": Object {\n          \"apiKey\": \"\uD83C\uDF4C\",\n        },\n      }\n    ");
    });
    it('does not attempt to merge non objects', function () {
        var merged = merged_options_1.mergedOptions({
            integrations: {
                CustomerIO: {
                    ghost: '👻'
                },
                Amplitude: {
                    apiKey: '🍌'
                }
            }
        }, {
            integrations: {
                // disabling customerIO as an integration override
                CustomerIO: false
            }
        });
        expect(merged).toMatchInlineSnapshot("\n      Object {\n        \"Amplitude\": Object {\n          \"apiKey\": \"\uD83C\uDF4C\",\n        },\n        \"CustomerIO\": Object {\n          \"ghost\": \"\uD83D\uDC7B\",\n        },\n      }\n    ");
    });
    it('works with boolean overrides', function () {
        var cdn = {
            integrations: {
                'Segment.io': { apiHost: 'api.june.so' },
                'Google Tag Manager': {
                    ghost: '👻'
                }
            }
        };
        var overrides = {
            integrations: {
                All: false,
                'Segment.io': { apiHost: 'mgs.instacart.com/v2' },
                'Google Tag Manager': true
            }
        };
        expect(merged_options_1.mergedOptions(cdn, overrides)).toMatchInlineSnapshot("\n      Object {\n        \"Google Tag Manager\": Object {\n          \"ghost\": \"\uD83D\uDC7B\",\n        },\n        \"Segment.io\": Object {\n          \"apiHost\": \"mgs.instacart.com/v2\",\n        },\n      }\n    ");
    });
});
//# sourceMappingURL=merged-options.test.js.map