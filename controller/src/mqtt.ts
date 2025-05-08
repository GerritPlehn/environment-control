import mqtt from "mqtt";
import { env } from "./env.ts";
import { handleHygroMqttMessage } from "./hygroLogger.ts";

export const mqttClient = mqtt.connect(env.MQTT_URL);

const topics = ["#"];

mqttClient.on("connect", () => {
	console.log("connected to mqtt broker");
	for (const topic of topics) {
		mqttClient.subscribe(topic, (err) => {
			if (err) {
				console.error(`error while subscribing to topic ${topic}`);
				return;
			}
			console.log(`subscribed to ${topic}`);
		});
	}
});

mqttClient.on("message", async (topic, message, packet) => {
	console.log(`message in ${topic}: ${message.toString()}`);
	handleHygroMqttMessage(message);
});

mqttClient.on("error", (err) => {
	console.error("MQTT Client Error:", err.message);
	mqttClient.end(true, () => {
		// TODO: what should happen when the program crashes? Do we need to change the shelly state?
		console.log("MQTT client disconnected due to error");
		process.exit(1);
	});
});
