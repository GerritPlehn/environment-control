import { Hono } from "hono";
import { env } from "./env.ts";
import { hygroData } from "./hygroLogger.ts";
const app = new Hono();

app.get("/", (c) =>
	c.json({
		settings: {
			mode: env.MODE,
			minHumidity: env.MIN_HUMIDITY,
			maxHumidity: env.MAX_HUMIDITY,
			minVPD: env.MIN_VPD,
			maxVPD: env.MAX_VPD,
		},
		hygroData,
	}),
);

export default app;
