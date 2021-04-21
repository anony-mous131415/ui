import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {
  BulkStrategyControllerService,
  BulkstrategiesValidationRequest,
  ApiResponseObjectListBulkstrategiesValidationResponse,
  ApiResponseObjectBulkstrategiesUpdateResponse
} from '@revxui/api-client-ts';
import { NgBlockUI, BlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-bulk-upload-modal',
  templateUrl: './bulk-upload-modal.component.html',
  styleUrls: ['./bulk-upload-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BulkUploadModalComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;

  showError = false;
  errorMessage: string;

  showInputBox = true;
  showValidationResult = false;
  showUpdateResult = false;

  inpStrategiesData = '';
  validStrategies: any;
  invalidStrategies: any;
  validStrategiesCount = 0;
  invalidStrategiesCount = 0;

  isStrategiesValidated = false;
  strategyUpdateDetails = {
    campaign: [],
    log: {
      valid: null,
      invalid: null
    }
  };
  collapse: boolean = true;
  requestInProgress: boolean = false;

  constructor(
    private modalRef: MatDialogRef<BulkUploadModalComponent>,
    @Inject(MAT_DIALOG_DATA) private configData: any,
    private bulkStrategyApiService: BulkStrategyControllerService
  ) { }

  ngOnInit() {
    this.blockUI.stop();
  }

  get config() {
    return this.configData;
  }

  get campaignList() {
    return this.strategyUpdateDetails.campaign;
  }

  checkIsDisabled() {
    return (this.inpStrategiesData === null || this.inpStrategiesData === undefined || this.inpStrategiesData.trim().length === 0);
  }

  onOkClick() {
    this.modalRef.close(null);
  }

  onSaveClick() {
    const request: BulkstrategiesValidationRequest = {
      fileContent: this.inpStrategiesData
    };
    this.blockUI.start();

    this.bulkStrategyApiService.confirmUpdateUsingPOST(request)
      .subscribe(
        (response: ApiResponseObjectBulkstrategiesUpdateResponse) => {
          this.handleUpdateResponse(response.respObject);
          this.blockUI.stop();
        },
        (error: any) => {
          this.blockUI.stop();
        }
      );
  }

  onCancelClick() {
    this.modalRef.close(null);
  }

  onBackClick() {
    this.showInputBox = true;
    this.showValidationResult = false;
    this.showUpdateResult = false;
    this.isStrategiesValidated = false;
  }

  openFilePicker() {
    document.getElementById('fileLoader').click();
  }

  fileChanged(event) {
    const file = (event.target.files.length > 0) ? event.target.files[0] : null;

    if (file !== null) {
      const isFileTypeValid = this.checkFileType(file);
      if (!isFileTypeValid) {
        this.setError(true, 'Please upload only .csv extension files.');
        return;
      } else {
        this.setError(false);
      }
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const fileData: string = fileReader.result.toString();

        if (fileData !== null && fileData !== undefined && fileData.trim().length > 0) {
          this.inpStrategiesData = fileData;
        }
      };

      fileReader.readAsText(file);
    }
  }

  validateStrategies() {

    if (this.inpStrategiesData === null || this.inpStrategiesData === undefined || this.inpStrategiesData === '') {
      this.setError(true, 'Please selecte a file or copy paste the contents of the file in the space provided below.');
    } else {
      this.setError(false);

      const request: BulkstrategiesValidationRequest = {
        fileContent: this.inpStrategiesData,
        filePath: null
      };
      this.blockUI.start();

      this.bulkStrategyApiService.importAndValidateTSVFileUsingPOST(request)
        .subscribe(
          (response: ApiResponseObjectListBulkstrategiesValidationResponse) => {
            this.handleValidationResponse(response.respObject);
            this.isStrategiesValidated = true;
            this.blockUI.stop();
          },
          (error: any) => {
            this.blockUI.stop();
          }
        );
    }
  }

  private checkFileType(file) {
    let isValidFileType = false;
    if (file.type !== null && file.type !== undefined) {
      isValidFileType = (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel') ? true : false;
    }

    return isValidFileType;
  }

  private handleValidationResponse(response: any) {
    this.showInputBox = false;
    this.showValidationResult = true;

    if (response !== null && response !== undefined) {
      this.validStrategies = [];
      this.invalidStrategies = [];

      response.forEach(item => {
        if (item.messages !== null && item.messages !== undefined && Array.isArray(item.messages) && item.messages.length > 0) {
          this.invalidStrategies.push({
            id: item.strategyId,
            name: item.strategyName,
            messages: item.messages
          });
        } else {
          this.validStrategies.push({
            id: item.strategyId,
            name: item.strategyName,
          });
        }
      });

      this.validStrategiesCount = this.validStrategies.length;
      this.invalidStrategiesCount = this.invalidStrategies.length;
    }
  }

  private handleUpdateResponse(response: any) {
    this.showUpdateResult = true;
    this.showValidationResult = false;
    this.config.title = 'Strategies update response';

    const uniqueCampaignIDs = [];
    response.strategiesUpdated.forEach(item => {
      if (uniqueCampaignIDs.indexOf(item.campaignId) === -1) {
        uniqueCampaignIDs.push(item.campaignId);
      }
    });
    response.strategiesFailedToUpdate.map(item => {
      if (uniqueCampaignIDs.indexOf(item.campaignId) === -1) {
        uniqueCampaignIDs.push(item.campaignId);
      }
    });
    // uniqueCampaignIDs = uniqueCampaignIDs.filter((v, i, a) => a.indexOf(v) === i);

    this.strategyUpdateDetails.campaign = this.getCampaignDetails(response, uniqueCampaignIDs);
    this.strategyUpdateDetails.log = this.getLogDetails(response);
  }

  private getCampaignDetails(response: any, uniqueCampaignIDs: string[]) {
    return uniqueCampaignIDs.map(campaignID => {
      const cntUpdated = response.strategiesUpdated.filter(item => item.campaignId === campaignID).length;
      const cntFailed = response.strategiesFailedToUpdate.filter(item => item.campaignId === campaignID && !item.noChange).length;
      const cntNoChange = response.strategiesFailedToUpdate.filter(item => item.campaignId === campaignID && item.noChange).length;

      let index = -1;
      let campaignName = '';
      index = response.strategiesUpdated.findIndex(item => item.campaignId === campaignID);
      if (index === -1) {
        index = response.strategiesFailedToUpdate.findIndex(item => item.campaignId === campaignID);
        campaignName = response.strategiesFailedToUpdate[index].campaignName;
      } else {
        campaignName = response.strategiesUpdated[index].campaignName;
      }

      return {
        id: campaignID,
        name: campaignName,
        processed: cntUpdated + cntFailed + cntNoChange,
        updated: cntUpdated,
        failed: cntFailed,
        noChange: cntNoChange
      };
    });
  }

  private getLogDetails(response: any) {

    function makeObj(inpId: any, inpName: any, inpMsg: any) {
      return {
        id: inpId,
        name: inpName,
        messages: inpMsg
      };
    }
    return {
      valid: response.strategiesUpdated
        .map(item => {
          return makeObj(item.strategyId, item.strategyName, item.message);
        }),
      invalid: response.strategiesFailedToUpdate
        .filter(item => !item.noChange)
        .map(item => {
          return makeObj(item.strategyId, item.strategyName, item.message);
        })
    };
  }

  private setError(isError: boolean, message?: string) {
    this.showError = isError;
    this.errorMessage = message;
  }

}
