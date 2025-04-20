# Environment Control

Control a Shelly Smart Plug using environmental factors measured by a bluetooth hygrometer.

![Graph describing system architecture, Smart Hygrometer being queried by Thermobeacon-Server, data being relayed via MQTT to Moquitto, Controller listening for data via MQTT to control Shelly Plug](./img/architecture.png)

The Hygrometer is queried via the [Thermobeacon](https://github.com/StefanRichterHuber/Thermobeacon-server) server, which relays the readings to an MQTT server (Mosquitto).

The [Controller](./controller/) is listening on the MQTT server and uses the readings to control a Shelly Plug via HTTP.

A webserver is also exposing the measurements and a subset of the configuration.

## Configuration

In `docker-compose.yml` change the `APP_DEVICES[0]_MAC` to correspond to your hygrometers bluetooth MAC. Refer to the official [Thermobeacon server docs](https://github.com/StefanRichterHuber/Thermobeacon-server?tab=readme-ov-file#configuration) for further info. Note that only 1 hygrometer is supported by this project.

Adapt the environment variables of `controller`

- `SHELLY_URL` Set to your Shelly's address, e.g. `http://10.20.0.41`
- `MODE` Either `VPD` or `HUMIDITY`, default: `VPD`
- `MAX_HUMIDITY` Humidity at which the Shelly will be turned off, default: `50`
- `MIN_HUMIDITY` Humidity at which the Shelly will be turned on, default: `40`
- `MAX_VPD` VPD at which the Shelly will be turned off, default: `1.2`
- `MIN_VPD` VPD at which the Shelly will be turned on, default: `0.8`
- `CHECK_INTERVAL_SEC` Interval at which the controller checks the latest MQTT message, default: `60`
