import { IsNotEmpty, IsString } from "class-validator"

export class SubscribeBody {
  @IsNotEmpty()
  @IsString()
  topic: string
}
