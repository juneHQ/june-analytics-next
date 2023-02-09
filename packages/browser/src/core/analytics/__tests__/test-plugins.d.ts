import { Context, Plugin } from '../../../index';
import type { DestinationPlugin } from '../../plugin';
export interface BasePluginOptions {
    shouldThrow?: boolean;
    shouldCancel?: boolean;
}
declare class BasePlugin implements Partial<Plugin> {
    version: string;
    private shouldCancel;
    private shouldThrow;
    constructor({ shouldCancel, shouldThrow, }: BasePluginOptions);
    isLoaded(): boolean;
    load(): Promise<void>;
    alias(ctx: Context): Context;
    group(ctx: Context): Context;
    identify(ctx: Context): Context;
    page(ctx: Context): Context;
    screen(ctx: Context): Context;
    track(ctx: Context): Context;
    private task;
}
export declare class TestBeforePlugin extends BasePlugin implements Plugin {
    name: string;
    type: "before";
}
export declare class TestEnrichmentPlugin extends BasePlugin implements Plugin {
    name: string;
    type: "enrichment";
}
export declare class TestDestinationPlugin extends BasePlugin implements DestinationPlugin {
    name: string;
    type: "destination";
    addMiddleware(): void;
    ready(): Promise<boolean>;
}
export declare class TestAfterPlugin extends BasePlugin implements Plugin {
    name: string;
    type: "after";
}
export {};
//# sourceMappingURL=test-plugins.d.ts.map