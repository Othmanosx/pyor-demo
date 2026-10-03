import { randomBytes, randomUUID } from 'node:crypto';
import type { Subscription } from './types.js';

export class SubscriptionStore {
  private readonly subs = new Map<string, Subscription>();

  add(input: Pick<Subscription, 'url' | 'events'>): Subscription {
    const sub: Subscription = {
      id: randomUUID(),
      url: input.url,
      events: input.events,
      secret: `whsec_${randomBytes(24).toString('hex')}`,
    };
    this.subs.set(sub.id, sub);
    return sub;
  }

  get(id: string): Subscription | undefined {
    return this.subs.get(id);
  }

  list(): Subscription[] {
    return [...this.subs.values()];
  }

  forEvent(event: string): Subscription[] {
    return this.list().filter((sub) => sub.events.includes(event));
  }

  remove(id: string): boolean {
    return this.subs.delete(id);
  }
}
