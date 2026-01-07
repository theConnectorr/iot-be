import { Module } from "@nestjs/common"
import { UsersController } from "./api/controllers/users.controller"
import { AuthController } from "./api/controllers/auth.controller"
import { JwtService } from "./services/jwt.service"
import { AuthService } from "./services/auth.service"
import { AccessAuthGuard } from "src/common/guards/access-auth.guard"

@Module({
  controllers: [UsersController, AuthController],
  providers: [JwtService, AuthService, AccessAuthGuard],
  exports: [JwtService],
})
export class UsersModule {}
