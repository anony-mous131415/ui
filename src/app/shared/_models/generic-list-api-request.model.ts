import { SearchRequest } from '@revxui/api-client-ts';

export interface GenericListApiRequest {
    advertiserId: number;
    entityId: number;
    name: string;
    pageNumber: number;
    pageSize: number;
    search: SearchRequest;
    refresh: boolean;
    sort: string;
}
