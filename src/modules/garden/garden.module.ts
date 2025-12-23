import { Module } from "@nestjs/common"
import { GardenController } from "./api/controllers/garden.controller"
import { GardenService } from "./services/garden.service"

@Module({
  controllers: [GardenController],
  providers: [GardenService],
})
export class GardenModule {}
