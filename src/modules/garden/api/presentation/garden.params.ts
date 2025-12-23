import { PaginatedQueryParams } from "src/common/api/rest/paginated-query-params.dto"

export class SensorDataFilterParams {}

export class SensorDataSortParams {}

export class SensorDataQueryParams extends PaginatedQueryParams {
  filter?: SensorDataFilterParams
  sort?: SensorDataSortParams
}
