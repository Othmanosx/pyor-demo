export interface Endpoint {
  id: string;
  url: string;
  events: string[];
  secret: string;
}

export type DeliveryStatus = 'pending' | 'delivered' | 'failed';

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

export type Fetcher = typeof fetch;
