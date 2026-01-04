import { IsEnum, IsNumber, IsString } from "class-validator"

export enum TriggerSensor {
  soilMoisture = "soilMoisture",
  temperature = "temperature",
  humidity = "humidity",
  lightLevel = "lightLevel",
  tankLevel = "tankLevel",
}

export enum Condition {
  EQ = "EQ",
  LT = "LT",
  GT = "GT",
}

export class CreateAutomationRuleBody {
  @IsString()
  name: string

  @IsEnum(TriggerSensor)
  triggerSensor: TriggerSensor

  @IsEnum(Condition)
  condition: string

  @IsNumber()
  threshold: number

  @IsString()
  actionPayload: string

  @IsNumber()
  cooldownSeconds: number
}
