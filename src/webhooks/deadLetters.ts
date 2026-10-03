import type { DeadLetter, Delivery } from './types.js';

export class DeadLetterStore {
  private readonly items = new Map<string, DeadLetter>();
  private readonly limit: number;

  constructor(limit: number) {
    this.limit = limit;
  }

  add(delivery: Delivery, failedAt = Date.now()): DeadLetter {
    const letter: DeadLetter = { ...delivery, status: 'dead', failedAt };
    this.items.set(letter.id, letter);
    const overflow = Math.max(0, this.items.size - this.limit);
    [...this.items.keys()].slice(0, overflow).forEach((id) => this.items.delete(id));
    return letter;
  }

  get(id: string): DeadLetter | undefined {
    return this.items.get(id);
  }

  list(): DeadLetter[] {
    return [...this.items.values()];
  }

  remove(id: string): boolean {
    return this.items.delete(id);
  }
}
