import { CoreContext, ContextCancelation, ContextFailedDelivery, SerializedContext, CancelationOptions } from '@segment/analytics-core';
import { SegmentEvent } from '../events/interfaces';
export declare class Context extends CoreContext<SegmentEvent> {
    static override: any;
    system(): any;
    constructor(event: SegmentEvent, id?: string);
}
export { ContextCancelation };
export type { ContextFailedDelivery, SerializedContext, CancelationOptions };
//# sourceMappingURL=index.d.ts.map