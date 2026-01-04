export class CreateAutomationRuleBody {
  name: string
  triggerSensor: string
  condition: string
  threshold: number
  actionDevice: string
  actionPayload: string
  cooldownSeconds: number
}
