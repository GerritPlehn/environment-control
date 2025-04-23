import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    MQTT_URL: z.string().default('http://mosquitto:1883'),
    MQTT_USER: z.string().default('telegraf'),
    MQTT_PASS: z.string().default('telegraf'),
    MAX_HISTORY_LENGTH: z.coerce.number().default(60 * 24),
    MODE: z.enum(['VPD', 'HUMIDITY']).default('VPD'),
    MAX_HUMIDITY: z.coerce.number().default(50),
    MIN_HUMIDITY: z.coerce.number().default(40),
    MAX_VPD: z.coerce.number().default(0.8),
    MIN_VPD: z.coerce.number().default(1.2),
    VPD_RESPECT_MAX_HUMIDITY: z
      .enum(['false', 'true'])
      .transform((value) => value === 'true'),
    SHELLY_URL: z.string().url(),
    CHECK_INTERVAL_SEC: z.coerce.number().default(60),
    PORT: z.coerce.number().default(3000),
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
