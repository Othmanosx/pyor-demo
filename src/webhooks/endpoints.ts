import { randomBytes, randomUUID } from 'node:crypto';
import type { Endpoint } from './types.js';

export class EndpointStore {
  private readonly byId = new Map<string, Endpoint>();

  add(input: Pick<Endpoint, 'url' | 'events'>): Endpoint {
    const endpoint: Endpoint = {
      id: randomUUID(),
      url: input.url,
      events: input.events,
      secret: `whsec_${randomBytes(24).toString('hex')}`,
    };
    this.byId.set(endpoint.id, endpoint);
    return endpoint;
  }

  get(id: string): Endpoint | undefined {
    return this.byId.get(id);
  }

  list(): Endpoint[] {
    return [...this.byId.values()];
  }

  forEvent(event: string): Endpoint[] {
    return this.list().filter((endpoint) => endpoint.events.includes(event));
  }

  remove(id: string): boolean {
    return this.byId.delete(id);
  }
}
