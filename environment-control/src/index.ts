import mqtt from 'mqtt';

import { env } from './env';

const mqttClient = mqtt.connect(env.MQTT_URL, {
  username: env.MQTT_USER,
  password: env.MQTT_PASS,
});

const topics = ['home/ThermoBeacon/Plant'];

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

mqttClient.on('message', (topic, message, packet) => {
  console.log(`message in ${topic}: ${message.toString()}`);
});

const gracefulShutdown = async () => {
  await mqttClient.endAsync();
  console.log('closed connections');
  process.exit();
};

process.on('beforeExit', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
