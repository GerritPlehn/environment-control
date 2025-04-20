import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    MQTT_URL: z.string().default('http://localhost:1883'),
    MQTT_USER: z.string().default('telegraf'),
    MQTT_PASS: z.string().default('telegraf'),
    MAX_HISTORY_LENGTH: z.coerce.number().default(60 * 24),
    MAX_HUMIDITY: z.coerce.number().default(50),
    MIN_HUMIDITY: z.coerce.number().default(40),
    SHELLY_URL: z.string().url(),
  },

  clientPrefix: 'CLIENT_',
  client: {},
  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: process.env,

  emptyStringAsUndefined: true,
});
