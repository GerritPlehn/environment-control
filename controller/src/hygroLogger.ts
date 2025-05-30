import { z } from "zod";
import { env } from "./env.ts";

type HygroInfo = HygroUpdate & { history: HygroUpdate[] };
type HygroUpdate = z.infer<typeof hygroSchema>;

export let hygroData: HygroInfo;

export function handleHygroMqttMessage(message: Buffer<ArrayBufferLike>) {
	try {
		const timestamp = new Date();
		const hygroUpdate = hygroSchema.parse({
			...JSON.parse(message.toString()),
			timestamp,
		});
		handleHygroUpdate(hygroUpdate);
	} catch (error) {
		console.error("Error while parsing MQTT packet", error);
	}
}

/**
 * Manage the current `hygroData` and the history.
 * @param hygroUpdate the update that was just received
 */
function handleHygroUpdate(hygroUpdate: HygroUpdate) {
	if (!hygroData) {
		// instantiate hygroData on first update
		hygroData = { ...hygroUpdate, history: [hygroUpdate] };
		return;
	}
	// update hygroData with newest data
	Object.assign(hygroData, hygroUpdate);
	// add newest data to history
	hygroData.history.push(hygroUpdate);
	if (hygroData.history.length > env.MAX_HISTORY_LENGTH) {
		// discard oldest history item when max history size has been reached
		hygroData.history.shift();
	}
}

const hygroSchema = z
	.object({
		name: z.string(),
		timestamp: z.date(),
		data: z.object({
			battery_level: z.number(),
			humidity: z.number(),
			temperature: z.number(),
			uptime: z.number(),
			mac: z.string(),
			max_temperature: z.number(),
			min_temperature: z.number(),
			max_temp_time: z.number(),
			min_temp_time: z.number(),
		}),
	})
	.transform((x) => {
		function calculateVPD(temperature: number, humidity: number) {
			const leafTemp = temperature + env.LEAF_TEMP_OFFSET;
			const vpsat =
				(610.7 * 10 ** ((7.5 * leafTemp) / (237.3 + leafTemp))) / 1000;
			const vpair =
				(((610.7 * 10 ** ((7.5 * temperature) / (237.3 + temperature))) /
					1000) *
					humidity) /
				100;

			return vpsat - vpair;
		}

		return {
			timestamp: x.timestamp,
			batteryLevel: x.data.battery_level,
			humidity: x.data.humidity,
			temperature: x.data.temperature,
			uptime: x.data.uptime,
			mac: x.data.mac,
			maxTemp: x.data.max_temperature,
			maxTempTime: x.data.max_temp_time,
			minTemp: x.data.min_temperature,
			minTempTime: x.data.min_temp_time,
			vpd: calculateVPD(x.data.temperature, x.data.humidity),
		};
	});
