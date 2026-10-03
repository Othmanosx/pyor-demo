# Webhooks

Relay delivers each event to every endpoint that listens for it. A delivery is one signed `POST` to the endpoint URL.

## Registering an endpoint

```http
POST /endpoints
{ "url": "https://example.com/hooks/relay", "events": ["order.paid"] }
```

The response includes a `secret`. It is shown once, so store it on your side.

## Request headers

| Header | Value |
| --- | --- |
| `x-relay-event` | Event name, for example `order.paid` |
| `x-relay-timestamp` | Unix time in milliseconds |
| `x-relay-signature` | Hex HMAC-SHA256 of `<timestamp>.<body>` with your secret |

Reject requests whose signature does not match, and requests with an old timestamp.

## Delivery

`POST /events` answers `202` right away with each delivery as `pending`. Relay then sends the request in the background.

A delivery is `delivered` when the receiver answers with a 2xx status within `DELIVERY_TIMEOUT_MS`. Anything else counts as a failed attempt.

## Retries

A failed attempt is retried with exponential backoff: `RETRY_BASE_MS` after the first failure, double that after the second, and so on, capped at `RETRY_MAX_MS`. After `RETRY_MAX_ATTEMPTS` attempts the delivery is marked `dead` and moved to the dead-letter store.

With the defaults the five attempts are spread over 7.5 seconds.

The dead-letter store keeps the newest `DEAD_LETTER_LIMIT` entries in memory. When it is full, the oldest entry is dropped.

## Configuration

| Variable | Default | Meaning |
| --- | --- | --- |
| `PORT` | `3000` | Port the server listens on |
| `DELIVERY_TIMEOUT_MS` | `5000` | Time to wait for the receiver per attempt |
| `RETRY_MAX_ATTEMPTS` | `5` | Attempts before a delivery is dead |
| `RETRY_BASE_MS` | `500` | Delay after the first failed attempt |
| `RETRY_MAX_MS` | `30000` | Upper bound for any single delay |
| `DEAD_LETTER_LIMIT` | `1000` | Dead deliveries kept in memory |
