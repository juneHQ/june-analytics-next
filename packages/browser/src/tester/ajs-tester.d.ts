import { Analytics } from '../core/analytics';
import { SerializedContext } from '../core/context';
import playwright from 'playwright';
declare type BrowserType = 'chromium' | 'firefox' | 'webkit';
declare function makeStub(page: playwright.Page): {
    register(...args: Parameters<Analytics['register']>): Promise<SerializedContext>;
    track(eventName: string | import("..").SegmentEvent, properties?: any, options?: any, callback?: any): Promise<SerializedContext>;
    page(category?: string | object | undefined, name?: any, properties?: any, options?: any, callback?: any): Promise<SerializedContext>;
    identify(id?: string | object | null | undefined, traits?: any, options?: any, callback?: any): Promise<SerializedContext>;
    browserPage: playwright.Page;
};
export declare const getBrowser: import("micro-memoize").MicroMemoize.Memoized<(browserType?: "chromium" | "firefox" | "webkit" | undefined, remoteDebug?: boolean | undefined) => Promise<playwright.Browser>>;
export declare function testerTeardown(): Promise<void>;
export declare function tester(_writeKey: string, url?: string, browserType?: BrowserType, remoteDebug?: boolean): Promise<ReturnType<typeof makeStub>>;
export {};
//# sourceMappingURL=ajs-tester.d.ts.map