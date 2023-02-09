import { Plugin } from '../../core/plugin';
import { Analytics } from '../../core/analytics';
import { LegacySettings } from '../../browser';
export declare type SegmentioSettings = {
    apiKey: string;
    apiHost?: string;
    protocol?: 'http' | 'https';
    addBundledMetadata?: boolean;
    unbundledIntegrations?: string[];
    bundledConfigIds?: string[];
    unbundledConfigIds?: string[];
    maybeBundledConfigIds?: Record<string, string[]>;
    deliveryStrategy?: {
        strategy?: 'standard' | 'batching';
        config?: {
            size?: number;
            timeout?: number;
        };
    };
};
export declare function segmentio(analytics: Analytics, settings?: SegmentioSettings, integrations?: LegacySettings['integrations']): Plugin;
//# sourceMappingURL=index.d.ts.map