import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common"
import { MqttClient } from "mqtt"
import { Subject } from "rxjs"
import { throttleTime } from "rxjs/operators"
import { MQTT_CLIENT } from "./mqtt.token"

@Injectable()
export class MqttService implements OnModuleDestroy {
  private message$ = new Subject<{ topic: string; payload: Buffer }>()

  private sseStream$ = new Subject<{ topic: string; data: any }>()

  constructor(@Inject(MQTT_CLIENT) private client: MqttClient) {
    this.message$
      .pipe(throttleTime(50)) // tune as needed
      .subscribe(({ topic, payload }) => this.handleMessage(topic, payload))

    this.client.on("message", (topic, payload) => {
      this.message$.next({ topic, payload })
    })
  }

  get sse$() {
    return this.sseStream$.asObservable()
  }

  publish<T>(topic: string, message: T) {
    const payload = Buffer.from(JSON.stringify(message))
    this.client.publish(topic, payload)
  }

  subscribe(topic: string) {
    this.client.subscribe(topic, (err, granted) => {
      if (err) console.error("[MQTT] subscribe error", err)
      else console.log("[MQTT] subscribed", granted)
    })
  }

  private handleMessage(topic: string, payload: Buffer) {
    let data: any
    try {
      data = JSON.parse(payload.toString())
    } catch (e) {
      console.warn("[MQTT] invalid JSON", topic, payload.toString())
      return
    }

    this.dispatch(topic, data)
  }

  private dispatch(topic: string, data: any) {
    console.log("[MQTT] dispatch", topic, data)

    // 👉 Gửi message ra cho SSE client
    this.sseStream$.next({ topic, data })
  }

  onModuleDestroy() {
    this.client.end()
  }
}
