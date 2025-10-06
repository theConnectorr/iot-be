import { Module } from "@nestjs/common"
import { MQTT_CLIENT } from "./mqtt.token"
import { MqttClient, connect } from "mqtt"
import { ConfigService } from "@nestjs/config"
import { getConfigValue } from "src/libs/util/config.util"
import { MqttController } from "./mqtt.controller"
import { MqttService } from "./mqtt.service"

@Module({
  controllers: [MqttController],
  providers: [
    {
      provide: MQTT_CLIENT,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const host = getConfigValue<string>(configService, "MOSQUITTO_HOST")
        const port = getConfigValue<string>(configService, "MOSQUITTO_PORT")
        const clientIdPrefix = getConfigValue<string>(
          configService,
          "MQTT_CLIENT_PREFIX",
        )
        const clientId = `${clientIdPrefix}${Math.random().toString(16).slice(2, 8)}`

        const url = `mqtt://${host}:${port}`

        const options = {
          clientId,
          keepalive: 60,
          reconnectPeriod: 2000,
          connectTimeout: 30 * 1000,
          clean: false,
          queueQoSZero: true,
        }

        const client: MqttClient = connect(url, options)

        client.on("connect", () => {
          console.log("[MQTT] connected")
        })

        client.on("reconnect", () => console.log("[MQTT] reconnecting..."))
        client.on("error", (err) => console.error("[MQTT] error", err))
        client.on("close", () => console.log("[MQTT] closed"))

        return client
      },
    },
    MqttService,
  ],
})
export class MQTTModule {}
