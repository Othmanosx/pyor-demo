import type { IncomingMessage, ServerResponse } from 'node:http';
import { json } from 'node:stream/consumers';

export function readBody(req: IncomingMessage): Promise<unknown> {
  return json(req).catch(() => undefined);
}

export function send(
  res: ServerResponse,
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): void {
  res.writeHead(status, { 'content-type': 'application/json', ...headers });
  res.end(JSON.stringify(body));
}
