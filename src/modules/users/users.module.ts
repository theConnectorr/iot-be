import { Module } from "@nestjs/common"
import { UsersController } from "./api/controllers/users.controller"
import { AuthController } from "./api/controllers/auth.controller"
import { JwtService } from "./services/jwt.service"
import { AuthService } from "./services/auth.service"

@Module({
  controllers: [UsersController, AuthController],
  providers: [JwtService, AuthService],
})
export class UsersModule {}
