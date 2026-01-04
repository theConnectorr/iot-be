import { IsOptional, IsString } from "class-validator"

export class GardenControlBody {
  @IsString()
  action: string

  @IsOptional()
  duration?: number

  @IsOptional()
  open?: boolean
}
