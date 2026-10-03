import { loadConfig } from './config.js';
import { createApp } from './router.js';
import { EndpointStore } from './webhooks/endpoints.js';

const config = loadConfig();
const app = createApp({ config, endpoints: new EndpointStore() });

app.listen(config.port, () => {
  console.log(`relay listening on :${config.port}`);
});
