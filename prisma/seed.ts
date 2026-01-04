import { faker } from "@faker-js/faker"
import { PrismaPg } from "@prisma/adapter-pg"
import * as bcrypt from "bcrypt"
import { PrismaClient } from "generated/prisma/client"

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
  }),
})

async function main() {
  console.log("🌱 Đang khởi tạo dữ liệu mẫu...")

  await prisma.actionLog.deleteMany()
  await prisma.sensorData.deleteMany()
  await prisma.automationRule.deleteMany()
  await prisma.device.deleteMany() // Xóa thiết bị
  await prisma.user.deleteMany() // Xóa user

  // 2. TẠO USER ADMIN & THIẾT BỊ TEST
  const salt = await bcrypt.genSalt()
  const hashedPassword = await bcrypt.hash("123456", salt)

  const adminEmail = "admin@gmail.com"
  const deviceSerial = "ESP32_TEST_001" // 🔥 KHỚP VỚI MOCK SCRIPT

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      fullName: "Quản Trị Viên",

      // Tạo luôn Device gắn vào User này (Quan hệ 1-1)
      device: {
        create: {
          name: "Vườn Thông Minh Demo",
          serialNumber: deviceSerial,
        },
      },
    },
    include: {
      device: true,
    },
  })

  console.log(`✅ Đã tạo Admin: ${admin.email} / 123456`)
  console.log(
    `✅ Đã gắn Device: ${admin.device?.name} (Serial: ${admin.device?.serialNumber})`,
  )

  const usersData = Array.from({ length: 5 }).map(() => ({
    email: faker.internet.email(),
    password: hashedPassword,
    fullName: faker.person.fullName(),
  }))

  await prisma.user.createMany({
    data: usersData,
  })

  console.log("✅ Đã tạo thêm 5 Users ngẫu nhiên (Chưa có thiết bị).")
}

main()
  .catch((e) => {
    console.error("❌ Lỗi Seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
