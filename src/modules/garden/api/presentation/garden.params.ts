import { Type } from "class-transformer"
import { IsEnum, IsOptional, ValidateNested } from "class-validator"
import { PaginatedQueryParams } from "src/common/api/rest/paginated-query-params.dto"

enum SensorDataRange {
  today = "today",
  week = "week",
  month = "month",
}

export class SensorDataFilterParams {
  @IsOptional()
  @IsEnum(SensorDataRange)
  range?: SensorDataRange = SensorDataRange.today
}

export class SensorDataSortParams {}

export class SensorDataQueryParams extends PaginatedQueryParams {
  @IsOptional()
  @ValidateNested()
  @Type(() => SensorDataFilterParams)
  filter?: SensorDataFilterParams

  @IsOptional()
  @ValidateNested()
  @Type(() => SensorDataSortParams)
  sort?: SensorDataSortParams
}
