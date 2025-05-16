import { Hono } from "hono";
import { env } from "./env.ts";
import { handleHygroUpdate, hygroData } from "./hygroLogger.ts";
import { toggles } from "./deviceControl.ts";
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
		toggles,
		hygroData,
	}),
);

app.get("/debug", (c) => {
	for (let i = 0; i < env.MAX_HISTORY_LENGTH; i++) {
		handleHygroUpdate({
			timestamp: new Date("2025-05-16T13:35:00.065Z"),
			batteryLevel: 82.17647,
			humidity: 38.875,
			temperature: 22,
			uptime: 4769743,
			mac: "67:AD:00:00:04:CE",
			maxTemp: 29.9375,
			maxTempTime: 2181969,
			minTemp: 14.3125,
			minTempTime: 507284,
			vpd: 1.3101806375293394,
		});
	}
	return c.json(200);
});

export default app;
