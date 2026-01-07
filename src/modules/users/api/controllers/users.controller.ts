import { Controller, Get, Req, UseGuards } from "@nestjs/common"
import { Request } from "express"
import { AccessAuthGuard } from "src/common/guards/access-auth.guard"
import { PrismaService } from "src/common/prisma/prisma.service"
import { ApiResponse } from "src/common/response/api-response.dto"

@Controller()
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("me")
  @UseGuards(AccessAuthGuard)
  async getMyInfo(@Req() req: Request) {
    const userId = req["user"].id

    const userInfo = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        device: true,
      },
    })

    return ApiResponse.success(userInfo)
  }
}
