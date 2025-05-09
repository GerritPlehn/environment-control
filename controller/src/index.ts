import { serve } from "@hono/node-server";
import { env } from "./env.ts";
import { hygroData } from "./hygroLogger.ts";
import { mqttClient } from "./mqtt.ts";
import { assertNever } from "./util.ts";
import app from "./webserver.ts";

serve({ fetch: app.fetch, port: env.PORT });

async function hygroControl() {
	if (!hygroData) {
		console.warn("no environment data available yet");
		return;
	}
	console.log({
		humidity: hygroData.humidity,
		vpd: hygroData.vpd,
		temperature: hygroData.temperature,
		min_vpd: env.MIN_VPD,
		max_vpd: env.MAX_VPD,
		min_rlf: env.MIN_HUMIDITY,
		max_rlf: env.MAX_HUMIDITY,
	});
	try {
		switch (env.MODE) {
			case "HUMIDITY": {
				if (hygroData.humidity < env.MIN_HUMIDITY) {
					await humidifier("on");
					return;
				}
				if (hygroData.humidity > env.MAX_HUMIDITY) {
					await humidifier("off");
				}
				return;
			}
			case "VPD": {
				if (hygroData.vpd < env.MIN_VPD) {
					await humidifier("off");
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

let lastToggle: Date;
export async function humidifier(state: "on" | "off") {
	console.log(`turning humidifier ${state}`);
	if (
		new Date().getTime() - (lastToggle?.getTime() ?? 0) <
		env.MIN_SWITCH_TIME
	) {
		console.log(
			"last switch too recent, last switched: ",
			lastToggle.toISOString(),
		);
		return;
	}
	await fetch(`${env.SHELLY_URL}/relay/0?turn=${state}`);
	lastToggle = new Date();
}

const gracefulShutdown = async () => {
	await mqttClient.endAsync();
	await humidifier("off");
	console.log("closed connections");
	process.exit();
};

process.on("beforeExit", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
