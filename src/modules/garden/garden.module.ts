import { Module } from "@nestjs/common"
import { GardenController } from "./api/controllers/garden.controller"
import { GardenService } from "./services/garden.service"
import { AccessAuthGuard } from "src/common/guards/access-auth.guard"
import { UsersModule } from "../users/users.module"

@Module({
  imports: [UsersModule],
  controllers: [GardenController],
  providers: [GardenService, AccessAuthGuard],
})
export class GardenModule {}
