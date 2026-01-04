import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from "@nestjs/common"
import { AccessAuthGuard } from "src/common/guards/access-auth.guard" // Giả sử bạn đã có Guard
import { AutomationService } from "../../services/automation.service"
import { Request } from "express"
import { CreateAutomationRuleBody } from "../presentation/create-automation-rule.body"
import { UpdateAutomationRuleBody } from "../presentation/update-automation-rule.body"
import { ApiResponse } from "src/common/response/api-response.dto"

@Controller("automations")
@UseGuards(AccessAuthGuard) // Bảo vệ API bằng JWT
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Get()
  async getRules(@Req() req: Request) {
    const userId = req["user"].id

    const rules = await this.automationService.getRules(userId)

    return ApiResponse.success(rules)
  }

  @Post()
  async createRule(
    @Req() req: Request,
    @Body() body: CreateAutomationRuleBody,
  ) {
    const userId = req["user"].id

    const newRule = await this.automationService.createRule(userId, body)

    return ApiResponse.success(newRule)
  }

  @Patch(":id")
  async updateRule(
    @Req() req: Request,
    @Param("id", ParseIntPipe) ruleId: number,
    @Body() body: UpdateAutomationRuleBody,
  ) {
    const userId = req["user"].id

    const updatedRule = await this.automationService.updateRule(
      userId,
      ruleId,
      body,
    )

    return ApiResponse.success(updatedRule)
  }

  @Delete(":id")
  async deleteRule(
    @Req() req: Request,
    @Param("id", ParseIntPipe) ruleId: number,
  ) {
    const userId = req["user"].id

    await this.automationService.deleteRule(userId, ruleId)

    return ApiResponse.success("delete rule successfully")
  }
}
