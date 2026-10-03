import { loadConfig } from './config.js';
import { createApp } from './router.js';
import { SubscriptionStore } from './webhooks/store.js';

const config = loadConfig();
const app = createApp({ config, subscriptions: new SubscriptionStore() });

app.listen(config.port, () => {
  console.log(`relay listening on :${config.port}`);
});
