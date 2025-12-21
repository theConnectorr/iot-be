import { AuthUser } from "../../../services/dtos/auth-user.interface"

export interface JwtUser {
  accessToken: string
  refreshToken: string
  user: AuthUser
}
