# pyor-demo

A small webhook relay in TypeScript. Register a subscription, post an event, and Relay sends a signed `POST` to every subscriber.

This repository is a sandbox used to show [Pyor](https://pyor.review) reviewing a realistic pull request. The code is small on purpose.

## Run it

```sh
npm ci
npm run build
npm start
```

```sh
curl -X POST localhost:3000/subscriptions \
  -d '{"url":"https://example.com/hook","events":["order.paid"]}'

curl -X POST localhost:3000/events \
  -d '{"event":"order.paid","payload":{"id":42}}'
```

## API

| Method | Path | Does |
| --- | --- | --- |
| `GET` | `/subscriptions` | List subscriptions |
| `POST` | `/subscriptions` | Create one, returns the signing secret once |
| `DELETE` | `/subscriptions/:id` | Remove one |
| `POST` | `/events` | Deliver an event to matching subscriptions |

Delivery and signing details are in [docs/webhooks.md](docs/webhooks.md).

## Develop

```sh
npm run lint
npm test
npm run typecheck
```
