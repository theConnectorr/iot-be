import { IsEnum, IsOptional, IsString } from "class-validator"

enum DeviceAction {
  WATER = "WATER",
  REFILL = "REFILL",
  AWNING = "AWNING",
}

export class GardenControlBody {
  @IsEnum(DeviceAction)
  action: DeviceAction

  @IsOptional()
  duration?: number

  @IsOptional()
  open?: boolean
}
