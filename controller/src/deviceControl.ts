import { env } from "./env.ts";

export async function humidifier(state: "on" | "off") {
	await device("humidifier", state);
}
export async function dehumidifier(state: "on" | "off") {
	await device("dehumidifier", state);
}

type State = "on" | "off";
type Device = "humidifier" | "dehumidifier";

export const toggles: Record<Device, { time: Date; state: State }[]> = {
	humidifier: [],
	dehumidifier: [],
};

export async function device(name: Device, state: State) {
	const lastDeviceToggle = toggles[name].at(-1);

	if (
		new Date().getTime() - (lastDeviceToggle?.time.getTime() ?? 0) <
		env.MIN_SWITCH_TIME
	) {
		console.log(
			"last switch too recent, last switched: ",
			lastDeviceToggle?.time.toISOString(),
		);
		return;
	}

	const deviceUrl =
		name === "humidifier"
			? env.HUMIDIFIER_SHELLY_URL
			: name === "dehumidifier"
				? env.DEHUMIDIFIER_SHELLY_URL
				: null;

	if (!deviceUrl) return;
	console.log(`turning ${name} ${state}`);

	await fetch(`${deviceUrl}/relay/0?turn=${state}`);
	toggles[name].push({ time: new Date(), state });
}
