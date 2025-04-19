#!/bin/sh
PASSWD_FILE="/mosquitto/config/password.txt"
USER=${MQTT_USER:-mqttuser}
PASS=${MQTT_PASSWORD:-mqttpassword}

if [ ! -f "$PASSWD_FILE" ]; then
    touch "$PASSWD_FILE"
fi

# Only add user if not already present
if ! grep -q "^$USER:" "$PASSWD_FILE"; then
    mosquitto_passwd -b "$PASSWD_FILE" "$USER" "$PASS"
fi

chown mosquitto:mosquitto "$PASSWD_FILE"
chmod 600 "$PASSWD_FILE"
