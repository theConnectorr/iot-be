import {
  Injectable,
  OnModuleInit,
  Logger,
  Inject,
  forwardRef,
} from "@nestjs/common"
import { MqttClient } from "mqtt"
import { GardenService } from "src/modules/garden/services/garden.service"
import { MQTT_CLIENT } from "./mqtt.token"

@Injectable()
export class MQTTService implements OnModuleInit {
  private readonly logger = new Logger(MQTTService.name)
  private readonly SUBSCRIBE_TOPIC = "devices/+/sensors"

  constructor(
    @Inject(forwardRef(() => GardenService))
    private readonly gardenService: GardenService,

    @Inject(MQTT_CLIENT) private readonly client: MqttClient,
  ) {}

  onModuleInit() {
    this.registerListeners()
  }

  private registerListeners() {
    this.client.subscribe(this.SUBSCRIBE_TOPIC, (err) => {
      if (err) {
        this.logger.error("Subscribe Failed:", err)
      } else {
        this.logger.log(`Subscribed to [${this.SUBSCRIBE_TOPIC}]`)
      }
    })

    // 2. Xử lý message
    this.client.on("message", async (topic, message) => {
      this.logger.log(`📨 Received [${topic}]: ${message.toString()}`)

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

  public publishCommand(serialNumber: string, payload: any) {
    const topic = `devices/${serialNumber}/control`
    this.client.publish(topic, JSON.stringify(payload))
    this.logger.log(`📤 Sent to [${serialNumber}]: ${JSON.stringify(payload)}`)
  }
}
