import mqtt from 'mqtt';
import { z } from 'zod';

import { env } from './env.ts';

const mqttClient = mqtt.connect(env.MQTT_URL);

const topics = ['#'];

mqttClient.on('connect', () => {
  console.log('connected to mqtt broker');
  for (const topic of topics) {
    mqttClient.subscribe(topic, (err) => {
      if (!err) {
        console.log(`subscribed to ${topic}`);
      }
    });
  }
});

const datapoints: HygroUpdate[] = [];

mqttClient.on('message', async (topic, message, packet) => {
  console.log(`message in ${topic}: ${message.toString()}`);
  try {
    const hygroUpdate = hygroSchema.parse(JSON.parse(message.toString()));
    datapoints.push(hygroUpdate);
    console.log('New datapoint', hygroUpdate);
  } catch (error) {
    console.error('Error while parsing MQTT packet', error);
  }
});

function handleHygroUpdate(update: HygroUpdate) {}

mqttClient.on('error', (err) => {
  console.error('MQTT Client Error:', err.message);
  mqttClient.end(true, () => {
    console.log('MQTT client disconnected due to error');
    process.exit(1);
  });
});

const hygroSchema = z.object({
  name: z.string(),
  data: z.object({
    battery_level: z.number(),
    humidity: z.number(),
    temperature: z.number(),
    uptime: z.number(),
    button_pressed: z.boolean(),
    mac: z.string(),
    max_temperature: z.number(),
    min_temperature: z.number(),
    max_temp_time: z.number(),
    min_temp_time: z.number(),
  }),
});

type HygroUpdate = z.infer<typeof hygroSchema>;

const gracefulShutdown = async () => {
  await mqttClient.endAsync();
  console.log('closed connections');
  process.exit();
};

process.on('beforeExit', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
