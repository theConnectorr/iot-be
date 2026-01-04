import { forwardRef, Module } from "@nestjs/common"
import { GardenController } from "./api/controllers/garden.controller"
import { GardenService } from "./services/garden.service"
import { AccessAuthGuard } from "src/common/guards/access-auth.guard"
import { UsersModule } from "../users/users.module"
import { AutomationController } from "./api/controllers/automation.controller"
import { MQTTModule } from "../mqtt/mqtt.module"
import { AutomationService } from "./services/automation.service"

@Module({
  imports: [UsersModule, forwardRef(() => MQTTModule)],
  controllers: [GardenController, AutomationController],
  providers: [AutomationService, GardenService, AccessAuthGuard],
  exports: [GardenService],
})
export class GardenModule {}
