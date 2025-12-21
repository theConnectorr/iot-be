import { AuthUser } from "./auth-user.interface"

export interface TokenPayload {
  user: AuthUser

  iat?: number
  exp?: number
}
