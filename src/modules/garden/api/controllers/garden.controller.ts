import { Controller, Get, UsePipes } from "@nestjs/common"
import { GardenService } from "../../services/garden.service"
import { QueryParamsValidationPipe } from "src/common/pipes/query-params-validation.pipe"
import { SensorDataQueryParams } from "../presentation/garden.params"
import { QueryParams } from "src/common/decorators/query-params.decorator"

@Controller("garden")
export class GardenController {
  constructor(private readonly gardenService: GardenService) {}

  @Get("sensors")
  public async getGardenSensorData(
    @QueryParams(new QueryParamsValidationPipe())
    params?: SensorDataQueryParams,
  ) {
    return await this.gardenService.getSensorData(params)
  }
}
