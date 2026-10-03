# Contributing

Thanks for taking a look. The relay is small, so most changes are one or two files.

## Setup

```sh
npm ci
npm test
```

Node 22 or newer. The test suite starts the server on a random port and replaces `fetch` for deliveries, so it needs no network.

## Before you open a pull request

```sh
npm run lint
npm run typecheck
npm test
```

CI runs the same three as separate jobs.

## Pull requests

- One concern per pull request. If the description needs the word "also", split it.
- Explain the problem first, then the fix. The description is what people read later when they wonder why the code looks the way it does.
- Add a test for behavior you change. Tests go through the public surface: the router for HTTP behavior, `deliver` for delivery behavior.
- Commit titles follow [Conventional Commits](https://www.conventionalcommits.org): `fix(webhooks): ...`, `feat(api): ...`, `docs: ...`.

## Reporting a bug

Open an issue with the request you sent, the response you got, and the response you expected. For a missed delivery, include the delivery `id` from the `POST /events` response.
