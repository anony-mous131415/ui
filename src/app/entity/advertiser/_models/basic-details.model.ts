import { BaseModel } from '@revxui/api-client-ts';

export interface AdvBasicDetails {
    name?: string;
    domain?: string;
    category?: BaseModel;
    currencyCode?: string;
    language?: BaseModel;
    id?: number;
    licenseeId?: number;
}
