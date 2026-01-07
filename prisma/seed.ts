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
  console.log("Seeding example data...")

  await prisma.actionLog.deleteMany()
  await prisma.sensorData.deleteMany()
  await prisma.automationRule.deleteMany()
  await prisma.device.deleteMany()
  await prisma.user.deleteMany()

  const salt = await bcrypt.genSalt()
  const hashedPassword = await bcrypt.hash("123456", salt)

  const adminEmail = "admin@gmail.com"

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      fullName: "Super User",
    },
  })

  console.log(`Admin created: ${admin.email} / 123456`)

  const usersData = Array.from({ length: 5 }).map(() => ({
    email: faker.internet.email(),
    password: hashedPassword,
    fullName: faker.person.fullName(),
  }))

  await prisma.user.createMany({
    data: usersData,
  })

  console.log("Create 5 more random users.")
}

main()
  .catch((e) => {
    console.error("Seeding error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
