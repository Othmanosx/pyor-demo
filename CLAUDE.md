# webhook-relay

House rules for anyone changing this repo, people and coding agents alike.

- Every timeout, retry count and size limit comes from `src/config.ts`. No numeric literals for them in the code that uses them.
- No `console.log` in `src/`. Write logs as JSON lines through the logger.
- A change to HTTP behavior comes with a router test. A change to delivery behavior comes with a `deliver` test.
- A function with more than three parameters takes one options object instead.
