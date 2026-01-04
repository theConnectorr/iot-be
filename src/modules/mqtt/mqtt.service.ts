import {
  Injectable,
  OnModuleInit,
  Logger,
  Inject,
  forwardRef,
} from "@nestjs/common"
import * as mqtt from "mqtt"
import { GardenService } from "src/modules/garden/services/garden.service"

@Injectable()
export class MQTTService implements OnModuleInit {
  private client: mqtt.MqttClient
  private readonly logger = new Logger(MQTTService.name)

  // Topic: devices/{serialNumber}/sensors
  private readonly SUBSCRIBE_TOPIC = "devices/+/sensors"

  constructor(
    @Inject(forwardRef(() => GardenService))
    private readonly gardenService: GardenService,
  ) {}

  onModuleInit() {
    this.connect()
  }

  private connect() {
    const host = process.env.MQTT_BROKER || "mqtt://localhost:1883"
    this.client = mqtt.connect(host, {
      clientId: "nestjs_gw_" + Math.random().toString(16).substr(2, 8),
    })

    this.client.on("connect", () => {
      this.logger.log("✅ MQTT Gateway Connected")
      this.client.subscribe(this.SUBSCRIBE_TOPIC)
    })

    this.client.on("message", async (topic, message) => {
      // Parse Topic: devices/ESP32_001/sensors
      const parts = topic.split("/")
      if (
        parts.length === 3 &&
        parts[0] === "devices" &&
        parts[2] === "sensors"
      ) {
        const serialNumber = parts[1]

        await this.gardenService.processIncomingData(
          serialNumber,
          message.toString(),
        )
      }
    })
  }

  // Hàm gửi lệnh xuống (Chỉ gửi, không xử lý logic)
  public publishCommand(serialNumber: string, payload: any) {
    const topic = `devices/${serialNumber}/control`

    this.client.publish(topic, JSON.stringify(payload))

    this.logger.log(`📤 Sent to [${serialNumber}]: ${JSON.stringify(payload)}`)
  }
}
