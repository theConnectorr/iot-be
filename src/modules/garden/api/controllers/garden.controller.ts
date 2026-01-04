import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Sse,
  UseGuards,
} from "@nestjs/common"
import { GardenService } from "../../services/garden.service"
import { QueryParamsValidationPipe } from "src/common/pipes/query-params-validation.pipe"
import { SensorDataQueryParams } from "../presentation/garden.params"
import { QueryParams } from "src/common/decorators/query-params.decorator"
import { AccessAuthGuard } from "src/common/guards/access-auth.guard"
import { Request } from "express"
import { filter, map, Observable } from "rxjs"
import { PrismaService } from "src/common/prisma/prisma.service"
import { GardenControlBody } from "../presentation/garden-control.body"

@UseGuards(AccessAuthGuard)
@Controller("garden")
export class GardenController {
  constructor(
    private readonly gardenService: GardenService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(AccessAuthGuard)
  @Sse("stream")
  async streamEvents(@Req() req: Request): Promise<Observable<MessageEvent>> {
    const userId = req["user"].id

    const device = await this.prisma.device.findUnique({
      where: { userId },
    })

    if (!device) {
      return new Observable()
    }

    return this.gardenService.sensorStream$.pipe(
      filter((event) => event.deviceId === device.id),
      map(
        (event) =>
          ({
            data: event.data,
          }) as MessageEvent,
      ),
    )
  }

  @UseGuards(AccessAuthGuard) // Bắt buộc đăng nhập
  @Post("control")
  @HttpCode(HttpStatus.OK)
  async controlDevice(@Req() req: Request, @Body() body: GardenControlBody) {
    const userId = req["user"].id

    // body mong đợi: { action: "WATER", duration: 5000 } hoặc { action: "AWNING", open: true }

    // Gọi Service xử lý logic (tìm device của user -> gửi MQTT)
    await this.gardenService.controlDevice(userId, body)

    return { success: true, message: `Đã gửi lệnh: ${body.action}` }
  }

  @Get("sensors")
  public async getGardenSensorData(
    @Req() request: Request,
    @QueryParams(new QueryParamsValidationPipe())
    params?: SensorDataQueryParams,
  ) {
    const user = request["user"]

    return await this.gardenService.getSensorData(user.id, params)
  }

  @Get("action-logs")
  public async getActionLogs(@Req() request: Request) {
    const user = request["user"]

    return await this.gardenService.getActionLogs(user.id)
  }
}
