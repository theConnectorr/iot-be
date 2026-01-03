import { Injectable } from "@nestjs/common"
import { PrismaService } from "src/common/prisma/prisma.service"
import { SensorDataQueryParams } from "../api/presentation/garden.params"

@Injectable()
export class GardenService {
  constructor(private readonly prisma: PrismaService) {}

  public async getSensorData(userId: string, params?: SensorDataQueryParams) {
    return this.prisma.sensorData.findMany({
      where: {
        userId,
      },
    })
  }
}
