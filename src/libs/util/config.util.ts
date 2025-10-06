import { ConfigService } from "@nestjs/config"
import { fromNullable, getOrThrowWith } from "effect/Option"

export const getConfigValue = <T>(
  configService: ConfigService,
  key: string,
): T => {
  return getOrThrowWith<T>(
    fromNullable(configService.get<T>(key)),
    () => new Error(`Missing ${key}`),
  )
}
