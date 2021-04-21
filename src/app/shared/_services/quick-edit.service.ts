import { Injectable } from '@angular/core';
import { StrategyControllerService, StrategyQuickEditDTO } from '@revxui/api-client-ts';
@Injectable({
  providedIn: 'root'
})
export class QuickEditService {

  constructor(
    private strControllerService: StrategyControllerService
  ) { }


  /**
   * 
   * @param id 
   * fetch the quick-editable details by id
   */
  getQuickEditDetails(id: number) {
    return this.strControllerService.getStrategyQuickEditDetailsUsingGET(id)
  }



  /**
   * 
   * @param id 
   * @param quickDto 
   * update the strategy QE api 
   */
  updateQuickEditDetails(id: number, quickDto: StrategyQuickEditDTO) {
    return this.strControllerService.saveStrategyQuickEditDetailsUsingPOST(id, quickDto);
  }
}
