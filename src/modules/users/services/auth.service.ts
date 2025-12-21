import { Injectable } from "@nestjs/common"
import { PrismaService } from "src/common/prisma/prisma.service"
import * as bcrypt from "bcrypt"
import { JwtService } from "./jwt.service"
import { UserNotFoundException } from "../api/exceptions/user-not-found.exception"
import { UnmatchedCredentialException } from "../api/exceptions/unmatched-credential.exception"

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  public async authenticateUser(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    })

    if (user === null) {
      throw new UserNotFoundException()
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new UnmatchedCredentialException()
    }

    const payload = {
      id: user.id,
      email: user.email,
    }

    return {
      accessToken: await this.jwtService.generateAccessToken(payload),
      refreshToken: await this.jwtService.generateRefreshToken(payload),
      user: payload,
    }
  }
}
