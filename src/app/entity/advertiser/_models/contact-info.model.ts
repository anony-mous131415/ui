import { BaseModel } from '@revxui/api-client-ts';

export interface AdvContactInfo {
    contactAddress?: string;
    contactNumber?: string;
    email?: string;
    region?: BaseModel;
    timeZone?: BaseModel;
    active?: boolean;
}