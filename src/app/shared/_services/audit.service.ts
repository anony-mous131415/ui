import { Injectable } from '@angular/core';
import { AuditControllerService } from '@revxui/api-client-ts';
import { ApiResponseObjectListAuditDetails } from '@revxui/api-client-ts/model/apiResponseObjectListAuditDetails';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuditService {
  constructor(
    public auditApiService: AuditControllerService
  ) { }

  // api call for popup modal on clicking the marker image
  getAuditFullDetails(startEpoch: number, endEpoch: number, entityType, entityId): Observable<ApiResponseObjectListAuditDetails> {
    return this.auditApiService.getAuditDetailsUsingGET(endEpoch, entityType, entityId, startEpoch);
  }

}
