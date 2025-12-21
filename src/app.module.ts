import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { MQTTModule } from "./modules/mqtt/mqtt.module"
import { PrismaModule } from "./common/prisma/prisma.module"
import { UsersModule } from "./modules/users/users.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MQTTModule,
    PrismaModule,
    UsersModule,
  ],
})
export class AppModule {}
