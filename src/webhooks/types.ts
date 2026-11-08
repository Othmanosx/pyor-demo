export interface Endpoint {
  id: string;
  url: string;
  events: string[];
  secret: string;
}

export type DeliveryStatus = 'pending' | 'delivered' | 'dead';

export interface Delivery {
  id: string;
  endpointId: string;
  event: string;
  payload: unknown;
  status: DeliveryStatus;
  attempts: number;
  lastError?: string;
  createdAt: number;
}

export interface DeadLetter extends Delivery {
  status: 'dead';
  failedAt: number;
}

export interface AttemptResult {
  ok: boolean;
  status?: number;
  error?: string;
}

export type Fetcher = typeof fetch;
