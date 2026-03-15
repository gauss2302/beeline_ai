export interface QueueJob<TPayload = Record<string, unknown>> {
  name: string;
  payload: TPayload;
}

export interface TaskQueue {
  enqueue<TPayload>(job: QueueJob<TPayload>): Promise<void>;
}

export class InlineTaskQueue implements TaskQueue {
  async enqueue(): Promise<void> {
    return;
  }
}
