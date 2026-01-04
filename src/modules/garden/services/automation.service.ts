import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common"
import { Device } from "generated/prisma/client"
import { PrismaService } from "src/common/prisma/prisma.service"
import { MQTTService } from "src/modules/mqtt/mqtt.service"
import { CreateAutomationRuleBody } from "../api/presentation/create-automation-rule.body"
import { UpdateAutomationRuleBody } from "../api/presentation/update-automation-rule.body"
import { AutomationRuleCreateInput } from "generated/prisma/models"
import { StandardizedSensorData } from "./garden.service"

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name)

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => MQTTService))
    private readonly mqttService: MQTTService,
  ) {}

  async checkRules(device: Device, sensorData: StandardizedSensorData) {
    const rules = await this.prisma.automationRule.findMany({
      where: {
        deviceId: device.id,
        isActive: true,
      },
    })

    if (rules.length === 0) return

    for (const rule of rules) {
      await this.evaluateRule(device, rule, sensorData)
    }
  }

  private async evaluateRule(
    device: Device,
    rule: any,
    data: StandardizedSensorData,
  ) {
    const currentValue = data[rule.triggerSensor]

    // Nếu gói tin không chứa sensor mà luật cần -> Bỏ qua
    if (currentValue === undefined || currentValue === null) return

    // 3. So sánh điều kiện
    let isTriggered = false
    switch (rule.condition) {
      case "LT": // Less Than (Nhỏ hơn)
        isTriggered = currentValue < rule.threshold
        break
      case "GT": // Greater Than (Lớn hơn)
        isTriggered = currentValue > rule.threshold
        break
      case "EQ": // Equal (Bằng)
        isTriggered = currentValue === rule.threshold
        break
    }

    if (!isTriggered) return

    // 4. Kiểm tra Cooldown (Chống spam lệnh liên tục)
    if (rule.lastTriggered) {
      const lastTime = new Date(rule.lastTriggered).getTime()
      const now = new Date().getTime()
      const diffSeconds = (now - lastTime) / 1000

      if (diffSeconds < rule.cooldownSeconds) {
        // Vẫn đang trong thời gian chờ -> Bỏ qua
        return
      }
    }

    // 5. THỰC THI HÀNH ĐỘNG
    this.logger.log(`⚡ Rule Triggered [${device.serialNumber}]: ${rule.name}`)

    try {
      const payload = JSON.parse(rule.actionPayload)

      // Gửi lệnh xuống MQTT qua Gateway (Dùng Serial Number)
      this.mqttService.publishCommand(device.serialNumber, payload)

      // Cập nhật thời gian kích hoạt
      await this.prisma.automationRule.update({
        where: { id: rule.id },
        data: { lastTriggered: new Date() },
      })

      // Ghi log hành động (Hệ thống tự động làm)
      await this.prisma.actionLog.create({
        data: {
          deviceId: device.id,
          type: "AUTO",
          action: payload.action,
          details: `Rule: ${rule.name} (Value: ${currentValue})`,
        },
      })
    } catch (error) {
      this.logger.error(`❌ Automation Error: ${error.message}`)
    }
  }

  async getRules(userId: string) {
    const device = await this.prisma.device.findUnique({ where: { userId } })
    if (!device) return []

    return this.prisma.automationRule.findMany({
      where: { deviceId: device.id },
      orderBy: { id: "desc" },
    })
  }

  async createRule(userId: string, body: CreateAutomationRuleBody) {
    const device = await this.prisma.device.findUnique({ where: { userId } })
    if (!device) throw new Error("Bạn chưa kết nối thiết bị!")

    const newRule: AutomationRuleCreateInput = {
      name: body.name,
      isActive: true,
      triggerSensor: body.triggerSensor,
      condition: body.condition,
      threshold: body.threshold,
      actionPayload: body.actionPayload,
      cooldownSeconds: body.cooldownSeconds || 300,
      lastTriggered: null,
      device: { connect: { id: device.id } },
    }

    return this.prisma.automationRule.create({
      data: newRule,
    })
  }

  async updateRule(
    userId: string,
    ruleId: number,
    body: UpdateAutomationRuleBody,
  ) {
    const count = await this.prisma.automationRule.count({
      where: {
        id: ruleId,
        device: { userId: userId },
      },
    })

    if (count === 0)
      throw new Error("Không tìm thấy luật hoặc không có quyền truy cập")

    return this.prisma.automationRule.update({
      where: { id: ruleId },
      data: body,
    })
  }

  async deleteRule(userId: string, ruleId: number) {
    const count = await this.prisma.automationRule.count({
      where: {
        id: ruleId,
        device: { userId: userId },
      },
    })

    if (count === 0) throw new Error("Không có quyền xóa")

    return this.prisma.automationRule.delete({
      where: { id: ruleId },
    })
  }
}
