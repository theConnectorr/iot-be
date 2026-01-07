import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common"
import { PrismaService } from "src/common/prisma/prisma.service"
import { SensorDataQueryParams } from "../api/presentation/garden.params"
import { MQTTService } from "src/modules/mqtt/mqtt.service"
import { AutomationService } from "./automation.service"
import { Subject } from "rxjs"
import { startOfDay, startOfHour, subDays } from "date-fns"

export interface StandardizedSensorData {
  temperature: number
  humidity: number
  lightLevel: number
  soilMoisture: number
  tankLevel: number
  isWatering: boolean
  isRefilling: boolean
  awning: boolean
}

@Injectable()
export class GardenService {
  private readonly logger = new Logger(GardenService.name)
  private sensorDataSubject = new Subject<{ deviceId: string; data: any }>()

  get sensorStream$() {
    return this.sensorDataSubject.asObservable()
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly automationService: AutomationService,
    @Inject(forwardRef(() => MQTTService))
    private readonly mqttService: MQTTService,
  ) {}

  public async getSensorData(userId: string, params?: SensorDataQueryParams) {
    let startDate = new Date()

    const range = params?.filter?.range || "today"

    if (range === "today") {
      startDate = startOfDay(new Date())
    } else if (range === "week") {
      startDate = subDays(new Date(), 7)
    } else if (range === "month") {
      startDate = subDays(new Date(), 30)
    }

    return this.prisma.sensorData.findMany({
      where: {
        device: {
          userId,
        },
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: "asc" },
      take: params?.limit,
      skip: params?.offset,
    })
  }

  async processIncomingData(serialNumber: string, payload: string) {
    try {
      // 1. Tìm Device
      const device = await this.prisma.device.findUnique({
        where: { serialNumber },
      })
      if (!device) return

      const stdData: StandardizedSensorData = JSON.parse(payload)

      // Làm tròn về đầu giờ
      const bucketTime = startOfHour(new Date())

      // === 🔥 FIX RACE CONDITION: RETRY LOOP ===
      // Thử tối đa 3 lần để xử lý tranh chấp
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          // Bước 1: Tìm bản ghi hiện tại
          const existingRecord = await this.prisma.sensorData.findUnique({
            where: {
              deviceId_timestamp: {
                deviceId: device.id,
                timestamp: bucketTime,
              },
            },
          })

          if (existingRecord) {
            // A. CẬP NHẬT (Update)
            const n = existingRecord.count
            await this.prisma.sensorData.update({
              where: { id: existingRecord.id },
              data: {
                count: n + 1,
                temperature: this.calcAvg(
                  existingRecord.temperature,
                  stdData.temperature,
                  n,
                ),
                humidity: this.calcAvg(
                  existingRecord.humidity,
                  stdData.humidity,
                  n,
                ),
                soilMoisture: this.calcAvg(
                  existingRecord.soilMoisture,
                  stdData.soilMoisture,
                  n,
                ),
                lightLevel: this.calcAvg(
                  existingRecord.lightLevel,
                  stdData.lightLevel,
                  n,
                ),
                tankLevel: this.calcAvg(
                  existingRecord.tankLevel,
                  stdData.tankLevel,
                  n,
                ),
              },
            })
          } else {
            // B. TẠO MỚI (Create)
            await this.prisma.sensorData.create({
              data: {
                deviceId: device.id,
                timestamp: bucketTime,
                count: 1,
                temperature: stdData.temperature,
                humidity: stdData.humidity,
                soilMoisture: stdData.soilMoisture,
                lightLevel: stdData.lightLevel,
                tankLevel: stdData.tankLevel,
              },
            })
          }

          // Nếu chạy đến đây tức là thành công (không lỗi) -> Thoát vòng lặp
          break
        } catch (dbError) {
          // Bắt lỗi trùng lặp (P2002)
          if (dbError.code === "P2002") {
            // Log nhẹ và thử lại (lần sau findUnique sẽ thấy bản ghi mới tạo)
            // this.logger.warn(`Race condition detected for ${serialNumber}, retrying...`);
            continue
          }
          // Nếu lỗi khác thì ném ra ngoài như thường
          throw dbError
        }
      }
      // === KẾT THÚC FIX ===

      // 3. Automation & SSE (Giữ nguyên)
      await this.automationService.checkRules(device, stdData)

      this.sensorDataSubject.next({
        deviceId: device.id,
        data: {
          ...stdData,
          timestamp: new Date(),
        },
      })
    } catch (error) {
      this.logger.error(`Logic Error [${serialNumber}]: ${error.message}`)
    }
  }

  // Hàm phụ trợ tính trung bình
  private calcAvg(
    oldAvg: number | null,
    newVal: number,
    count: number,
  ): number {
    const currentAvg = oldAvg || 0
    // Làm tròn 2 chữ số thập phân
    return parseFloat(((currentAvg * count + newVal) / (count + 1)).toFixed(2))
  }
  // 2. HÀM ĐIỀU KHIỂN THIẾT BỊ (Gọi từ API Controller)
  async controlDevice(userId: string, actionPayload: any) {
    const device = await this.prisma.device.findUnique({
      where: { userId },
    })

    if (!device) throw new Error("User chưa kết nối thiết bị!")

    this.mqttService.publishCommand(device.serialNumber, actionPayload)

    await this.prisma.actionLog.create({
      data: {
        deviceId: device.id,
        type: "MANUAL",
        action: actionPayload.action,
        details: JSON.stringify(actionPayload),
      },
    })
  }

  async getActionLogs(userId: string) {
    return await this.prisma.actionLog.findMany({
      where: {
        device: {
          userId,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    })
  }

  async claimDevice(userId: string, serialNumber: string) {
    const device = await this.prisma.device.findUnique({
      where: { serialNumber },
      include: { user: true },
    })

    if (device) {
      throw new BadRequestException("Device is already claimed by another user")
    }

    const createdDevice = await this.prisma.device.create({
      data: {
        serialNumber,
        userId,
      },
    })

    await this.prisma.automationRule.createMany({
      data: [
        {
          deviceId: createdDevice.id,
          name: "Water tank refill",
          isActive: true,
          triggerSensor: "tankLevel",
          condition: "LT",
          threshold: 20,
          actionPayload: JSON.stringify({ action: "REFILL", duration: 5000 }),
          cooldownSeconds: 600,
        },
        {
          deviceId: createdDevice.id,
          name: "Water when the soil is dry",
          isActive: true,
          triggerSensor: "soilMoisture",
          condition: "LT",
          threshold: 30,
          actionPayload: JSON.stringify({ action: "WATER", duration: 3000 }),
          cooldownSeconds: 300,
        },
        {
          deviceId: createdDevice.id,
          name: "Awning open",
          isActive: true,
          triggerSensor: "lightLevel",
          condition: "GT",
          threshold: 3000,
          actionPayload: JSON.stringify({ action: "AWNING", open: true }),
          cooldownSeconds: 60,
        },
      ],
    })

    return { success: true, message: "Device claimed successfully!" }
  }
}
