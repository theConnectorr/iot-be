import { ConfigService } from "@nestjs/config"
import * as jwt from "jsonwebtoken"
import { fromNullable, liftThrowable, Option } from "effect/Option"
import { Injectable } from "@nestjs/common"
import "reflect-metadata"
import { getConfigValue } from "src/common/utils/config.util"
import { AuthUser } from "./dtos/auth-user.interface"
import { JwtUser } from "../api/presentation/response/jwt-user.response"
import { TokenPayload } from "./dtos/token-payload.interface"

@Injectable()
export class JwtService {
  private readonly accessTokenSecret: string
  private readonly accessTokenExpiration: number
  private readonly refreshTokenSecret: string
  private readonly refreshTokenExpiration: number

  constructor(private readonly configService: ConfigService) {
    this.accessTokenSecret = getConfigValue<string>(
      this.configService,
      "ACCESS_TOKEN_SECRET",
    )

    this.accessTokenExpiration = getConfigValue<number>(
      this.configService,
      "ACCESS_TOKEN_EXPIRATION_SECONDS",
    )

    this.refreshTokenSecret = getConfigValue<string>(
      this.configService,
      "REFRESH_TOKEN_SECRET",
    )

    this.refreshTokenExpiration = getConfigValue<number>(
      this.configService,
      "REFRESH_TOKEN_EXPIRATION_SECONDS",
    )
  }

  async generateAccessToken(user: AuthUser): Promise<string> {
    const payload: TokenPayload = {
      user,
    }

    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: `${this.accessTokenExpiration}s`,
    })
  }

  async generateRefreshToken(user: AuthUser): Promise<string> {
    const payload: TokenPayload = {
      user,
    }

    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: `${this.refreshTokenExpiration}s`,
    })
  }

  async generateJwtUser(user: AuthUser): Promise<Option<JwtUser>> {
    const accessToken = await this.generateAccessToken(user)
    const refreshToken = await this.generateRefreshToken(user)

    return fromNullable({
      accessToken,
      refreshToken,
      user,
    })
  }

  async verifyAccessToken(accessToken: string): Promise<Option<TokenPayload>> {
    const payload = this.verifyJwt<TokenPayload>(
      accessToken,
      this.accessTokenSecret,
    )

    return payload
  }

  async verifyRefreshToken(
    refreshToken: string,
  ): Promise<Option<TokenPayload>> {
    const payload = this.verifyJwt<TokenPayload>(
      refreshToken,
      this.refreshTokenSecret,
    )

    return payload
  }

  async generateJwtUserFromRefreshToken(
    refreshToken: string,
    refreshTokenPayload: TokenPayload,
  ): Promise<Option<JwtUser>> {
    const { user } = refreshTokenPayload

    const cleanAuthUser = this.clean(user)

    const accessToken = await this.generateAccessToken(cleanAuthUser)

    return fromNullable({
      accessToken,
      refreshToken,
      user: cleanAuthUser,
    })
  }

  private verifyJwt<T>(token: string, secret: string): Option<T> {
    return liftThrowable(() => jwt.verify(token, secret) as T)()
  }

  private clean(user: AuthUser): AuthUser {
    const { id, email } = user
    return { id, email }
  }
}
