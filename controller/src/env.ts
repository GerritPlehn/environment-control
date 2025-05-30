import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		MQTT_URL: z.string().default("http://mosquitto:1883"),
		MQTT_USER: z.string().default("telegraf"),
		MQTT_PASS: z.string().default("telegraf"),
		MAX_HISTORY_LENGTH: z.coerce.number().default(60 * 24),
		MODE: z.enum(["VPD", "HUMIDITY"]).default("VPD"),
		MAX_HUMIDITY: z.coerce.number().default(50),
		MIN_HUMIDITY: z.coerce.number().default(40),
		MAX_VPD: z.coerce.number().default(1.2),
		MIN_VPD: z.coerce.number().default(0.8),
		VPD_RESPECT_MAX_HUMIDITY: z
			.enum(["false", "true"])
			.default("false")
			.transform((value) => value === "true"),
		HUMIDIFIER_SHELLY_URL: z.string().url().optional(),
		DEHUMIDIFIER_SHELLY_URL: z.string().url().optional(),
		CHECK_INTERVAL_SEC: z.coerce.number().default(60),
		PORT: z.coerce.number().default(3000),
		MIN_SWITCH_TIME: z.coerce
			.number()
			.default(0)
			.transform((minutes) => minutes * 60 * 1000),
		LEAF_TEMP_OFFSET: z.coerce.number().default(-2),
	},

	clientPrefix: "CLIENT_",
	client: {},
	/**
	 * What object holds the environment variables at runtime. This is usually
	 * `process.env` or `import.meta.env`.
	 */
	runtimeEnv: process.env,

	emptyStringAsUndefined: true,
});
