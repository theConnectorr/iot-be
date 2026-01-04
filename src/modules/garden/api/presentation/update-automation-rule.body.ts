import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator"
import { Condition, TriggerSensor } from "./create-automation-rule.body"

export class UpdateAutomationRuleBody {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsEnum(TriggerSensor)
  triggerSensor?: string

  @IsOptional()
  @IsEnum(Condition)
  condition?: string

  @IsOptional()
  @IsNumber()
  threshold?: number

  @IsOptional()
  @IsString()
  actionPayload?: string

  @IsOptional()
  @IsNumber()
  cooldownSeconds?: number
}
