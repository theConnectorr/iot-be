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

  // 1. Xóa dữ liệu cũ (Reset)
  await prisma.actionLog.deleteMany()
  await prisma.sensorData.deleteMany() // Xóa data cảm biến nếu có
  await prisma.user.deleteMany()

  // 2. Tạo Admin
  const salt = await bcrypt.genSalt()
  const hashedPassword = await bcrypt.hash("123456", salt)

  await prisma.user.create({
    data: {
      email: "admin@gmail.com",
      password: hashedPassword,
      fullName: "Quản Trị Viên",
      // hashedRefreshToken để null
    },
  })

  // 3. Tạo User ngẫu nhiên
  const usersData = Array.from({ length: 10 }).map(() => ({
    email: faker.internet.email(),
    password: hashedPassword,
    fullName: faker.person.fullName(),
  }))

  await prisma.user.createMany({
    data: usersData,
  })

  console.log("✅ Đã tạo xong: 1 Admin + 10 Users.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
