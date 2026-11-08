---
paths:
  - "src/webhooks/**"
---

# Webhook delivery

- A 4xx answer is the receiver's final word. Never retry it: mark the delivery failed.
- Sign every attempt with its own timestamp. Never reuse a signature across retries.
- Anything that can grow without bound (queues, per-endpoint maps, dead letters) has a cap that comes from config.
