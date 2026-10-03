import { loadConfig } from './config.js';
import { createApp } from './router.js';
import { DeadLetterStore } from './webhooks/deadLetters.js';
import { EndpointStore } from './webhooks/endpoints.js';

const config = loadConfig();
const app = createApp({
  config,
  endpoints: new EndpointStore(),
  deadLetters: new DeadLetterStore(config.deadLetterLimit),
});

app.listen(config.port, () => {
  console.log(`relay listening on :${config.port}`);
});
