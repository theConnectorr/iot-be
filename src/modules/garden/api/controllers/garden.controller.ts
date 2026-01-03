import { Controller, Get, Req, UseGuards, UsePipes } from "@nestjs/common"
import { GardenService } from "../../services/garden.service"
import { QueryParamsValidationPipe } from "src/common/pipes/query-params-validation.pipe"
import { SensorDataQueryParams } from "../presentation/garden.params"
import { QueryParams } from "src/common/decorators/query-params.decorator"
import { AccessAuthGuard } from "src/common/guards/access-auth.guard"
import { Request } from "express"

@UseGuards(AccessAuthGuard)
@Controller("garden")
export class GardenController {
  constructor(private readonly gardenService: GardenService) {}

  @Get("sensors")
  public async getGardenSensorData(
    @Req() request: Request,
    @QueryParams(new QueryParamsValidationPipe())
    params?: SensorDataQueryParams,
  ) {
    const user = request["user"]

    return await this.gardenService.getSensorData(user.id, params)
  }
}
