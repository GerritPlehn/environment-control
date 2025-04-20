import { mqttClient } from './mqtt.ts';
import { hygroData } from './hygroLogger.ts';
import { env } from './env.ts';

async function hygroControl() {
  console.log(hygroData);

  if (hygroData.humidity < env.MIN_HUMIDITY) {
    console.log('turn on humidifier');
    // await fetch(`${env.SHELLY_URL}/relay/0?turn=on`);
  }
  if (hygroData.humidity > env.MAX_HUMIDITY) {
    console.log('turn off humidifier');
    // await fetch(`${env.SHELLY_URL}/relay/0?turn=off`);
  }
}
setInterval(hygroControl, 1000);

const gracefulShutdown = async () => {
  await mqttClient.endAsync();
  console.log('closed connections');
  process.exit();
};

process.on('beforeExit', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
