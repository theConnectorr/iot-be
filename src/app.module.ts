import { Module } from "@nestjs/common"
import { MQTTModule } from "./mqtt/mqtt.module"
import { ConfigModule } from "@nestjs/config"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MQTTModule,
  ],
})
export class AppModule {}
