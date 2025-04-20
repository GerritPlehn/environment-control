import { mqttClient } from './mqtt.ts';
import { hygroData } from './hygroLogger.ts';
import { env } from './env.ts';
import { serve } from '@hono/node-server';
import app from './webserver.ts';
import { assertNever } from './util.ts';

serve({ fetch: app.fetch, port: env.PORT });

async function hygroControl() {
  try {
    switch (env.MODE) {
      case 'HUMIDITY': {
        if (hygroData.humidity < env.MIN_HUMIDITY) {
          console.log('turn on humidifier');
          await fetch(`${env.SHELLY_URL}/relay/0?turn=on`);
        }
        if (hygroData.humidity > env.MAX_HUMIDITY) {
          console.log('turn off humidifier');
          await fetch(`${env.SHELLY_URL}/relay/0?turn=off`);
        }
        break;
      }
      case 'VPD': {
        if (hygroData.vpd < env.MIN_VPD) {
          console.log('turn off humidifier');
          await fetch(`${env.SHELLY_URL}/relay/0?turn=off`);
        }
        if (hygroData.vpd > env.MAX_VPD) {
          console.log('turn on humidifier');
          await fetch(`${env.SHELLY_URL}/relay/0?turn=on`);
        }
        break;
      }
      default: {
        assertNever(env.MODE);
      }
    }
  } catch (error) {
    console.error('failed to switch shelly output!');
  }
}
setInterval(hygroControl, 1000 * env.CHECK_INTERVAL_SEC);

const gracefulShutdown = async () => {
  await mqttClient.endAsync();
  console.log('closed connections');
  process.exit();
};

process.on('beforeExit', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
