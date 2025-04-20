import { Hono } from 'hono';
import { hygroData } from './hygroLogger.ts';
import { env } from './env.ts';
const app = new Hono();

app.get('/', (c) =>
  c.json({
    settings: {
      minHumidity: env.MIN_HUMIDITY,
      maxHumidity: env.MAX_HUMIDITY,
    },
    hygroData,
  })
);

export default app;
