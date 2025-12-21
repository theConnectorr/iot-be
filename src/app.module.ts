import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { MQTTModule } from "./modules/mqtt/mqtt.module"
import { PrismaModule } from "./common/prisma/prisma.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MQTTModule,
    PrismaModule,
  ],
})
export class AppModule {}
