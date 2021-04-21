import { BaseModel } from '@revxui/api-client-ts';

export interface BreadcrumbsModel {
    licensee: BaseModel,
    advertiser: BaseModel,
    strategy: BaseModel,
    campaign: BaseModel
}
