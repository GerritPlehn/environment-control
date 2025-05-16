import { serve } from "@hono/node-server";
import { env } from "./env.ts";
import { hygroData } from "./hygroLogger.ts";
import { mqttClient } from "./mqtt.ts";
import { assertNever } from "./util.ts";
import { humidifier, dehumidifier } from "./deviceControl.ts";
import app from "./webserver.ts";

console.log("settings:", {
	mode: env.MODE,
	min_vpd: env.MIN_VPD,
	max_vpd: env.MAX_VPD,
	min_rlf: env.MIN_HUMIDITY,
	max_rlf: env.MAX_HUMIDITY,
	humidifier: env.HUMIDIFIER_SHELLY_URL,
	dehumidifier: env.DEHUMIDIFIER_SHELLY_URL,
});

async function hygroControl() {
	if (!hygroData) {
		console.warn("no environment data available yet");
		return;
	}
	console.log("current data: ", {
		time: hygroData.timestamp,
		humidity: hygroData.humidity,
		vpd: hygroData.vpd,
		temperature: hygroData.temperature,
	});
	try {
		switch (env.MODE) {
			case "HUMIDITY": {
				if (hygroData.humidity < env.MIN_HUMIDITY) {
					await humidifier("on");
					return;
				}
				if (hygroData.humidity > env.MAX_HUMIDITY) {
					await dehumidifier("on");
					return;
				}
				if (hygroData.humidity > (env.MAX_HUMIDITY + env.MIN_HUMIDITY) / 2) {
					await humidifier("off");
					return;
				}
				if (hygroData.humidity < (env.MAX_HUMIDITY + env.MIN_HUMIDITY) / 2) {
					await dehumidifier("off");
					return;
				}
				return;
			}
			case "VPD": {
				if (hygroData.vpd < env.MIN_VPD) {
					await dehumidifier("on");
					return;
				}
				if (hygroData.vpd > env.MAX_VPD) {
					if (
						env.VPD_RESPECT_MAX_HUMIDITY &&
						hygroData.humidity > env.MAX_HUMIDITY
					) {
						console.log(
							"max VPD exceeded, but max humidity already reached: not turning on",
						);
						return;
					}
					await humidifier("on");
					return;
				}

				if (hygroData.vpd < (env.MIN_VPD + env.MAX_VPD) / 2) {
					await humidifier("off");
					return;
				}
				if (hygroData.vpd > (env.MIN_VPD + env.MAX_VPD) / 2) {
					await dehumidifier("off");
					return;
				}
				return;
			}
			default: {
				assertNever(env.MODE);
			}
		}
	} catch (error) {
		console.error("failed to switch shelly output!");
	}
}
setInterval(hygroControl, 1000 * env.CHECK_INTERVAL_SEC);

serve({ fetch: app.fetch, port: env.PORT });

async function gracefulShutdown() {
	await humidifier("off");
	await dehumidifier("off");
	console.log("turned off devices");
	await mqttClient.endAsync();
	console.log("closed connections");
	process.exit();
}

process.on("beforeExit", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
