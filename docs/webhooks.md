# Webhooks

Relay delivers each event to every subscription that listens for it. A delivery is one signed `POST` to the subscription URL.

## Subscribing

```http
POST /subscriptions
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

A delivery is `delivered` when the receiver answers with a 2xx status within `DELIVERY_TIMEOUT_MS`. Anything else marks the delivery `failed`. Failed deliveries are not retried.

## Configuration

| Variable | Default | Meaning |
| --- | --- | --- |
| `PORT` | `3000` | Port the server listens on |
| `DELIVERY_TIMEOUT_MS` | `5000` | Time to wait for the receiver |
