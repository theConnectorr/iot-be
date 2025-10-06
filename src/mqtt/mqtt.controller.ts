import { Body, Controller, Post } from "@nestjs/common"
import { PublishBody } from "./presentation/bodies/publish.body"
import { MqttService } from "./mqtt.service"
import { SubscribeBody } from "./presentation/bodies/subscribe.body"

@Controller("mqtt")
export class MqttController {
  constructor(private readonly mqttService: MqttService) {}

  @Post("publish")
  async publishMessage(@Body() body: PublishBody) {
    const { topic, message } = body

    this.mqttService.publish(topic, message)

    return { msg: `Published to topic ${topic}: ${message}` }
  }

  @Post("subscribe")
  async subscribeToTopic(@Body() body: SubscribeBody) {
    const { topic } = body

    this.mqttService.subscribe(topic)

    return { msg: `Subscribed to topic ${topic}` }
  }
}
