import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { StrategyService } from '@app/entity/strategy/_services/strategy.service';
import {
  ApiResponseObjectSiteListDTO,
  BaseModel,
  SiteListRequest,
  StrategyControllerService
} from '@revxui/api-client-ts';


// REVX-877 : targeting limit
const APP_LIMIT = 10000;

@Component({
  selector: 'app-ios-app-category-modal',
  templateUrl: './app-target-modal.component.html',
  styleUrls: ['./app-target-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppTargetModalComponent implements OnInit {

  domainsValid: BaseModel[] = [];

  textDomains = '';
  textDomainsValid = '';

  validCount = 0;
  invalidCount = 0;

  showValidatedResults = false;
  selOption: number;
  showError = false;
  errorMsg: string = '';


  showProgressBar: boolean = false;

  constructor(
    private apiService: StrategyControllerService,
    private strService: StrategyService,
    private modalRef: MatDialogRef<AppTargetModalComponent>,
    @Inject(MAT_DIALOG_DATA) private configData: any
  ) { }

  ngOnInit() {
    const checkedOption = this.configData.targetOptions.findIndex(opt => opt.checked);
    this.selOption = this.configData.targetOptions[checkedOption].value;

    this.textDomains = this.configData.selectionList.map(item => item.name).join('\n');
  }

  get config() {
    return this.configData;
  }

  onSaveClick() {
    this.modalRef.close({
      ...this.configData,
      selection: this.selOption,
      selectionList: this.domainsValid,
    });
  }

  onCancelClick() {
    this.modalRef.close(null);
  }

  fileChanged(event) {
    this.setError(false, null);
    const file = (event.target.files.length > 0) ? event.target.files[0] : null;

    if (file !== null) {
      const isFileTypeValid = this.checkFileType(file);
      if (!isFileTypeValid) {
        this.setError(true, 'Please upload only .csv extension files.');
        return;
      }
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const fileData: string = fileReader.result.toString();
        if (fileData !== null && fileData !== undefined && fileData.trim().length > 0) {

          const splitRegEx = /[,\n\t]/;
          let domainList = fileData.split(splitRegEx);
          domainList = domainList.map(data => data.trim());

          // REVX-877 : targeting limit
          if (domainList.length > APP_LIMIT) {
            this.textDomains = '';
            this.setError(true, 'Only 10,000 apps can be targeted.');
            return;
          } else {
            this.textDomains = domainList.map(data => data.trim() + '\n').join('');
          }
        }
      };
      fileReader.readAsText(file);
    }
    
  }

  checkFileType(file) {
    let isValidFileType = false;
    if (file.type !== null && file.type !== undefined) {
      isValidFileType = (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel') ? true : false;
    }

    return isValidFileType;
  }

  openFilePicker() {
    document.getElementById('fileLoader').click();
  }

  validateDomains() {

    // REVX-875 disable button while api call
    this.setError(false, null);
    this.showProgressBar = true;
    let domainList: string[] = [];
    this.textDomains.split('\n').forEach(domain => {
      if (domain !== null && domain !== undefined && domain.trim().length > 0 && !domainList.includes(domain)) {
        domainList.push(domain);
      }
    });

    if (domainList.length === 0) {
      this.showProgressBar = false
      return;
    }

    // REVX-877 : targeting limit
    else if (domainList.length > APP_LIMIT) {
      this.setError(true, 'Only 10,000 apps can be targeted.');
      this.showProgressBar = false;
      return;
    }

    const sites: SiteListRequest = {
      sites: domainList
    };

    this.apiService.validateSitesUsingPOST(sites, null, this.strService.getAuthToken()).subscribe(
      (response: ApiResponseObjectSiteListDTO) => {
        this.showValidatedResults = true;
        this.invalidCount = response.respObject.invalidSites.length;
        this.domainsValid.push(...response.respObject.validSites);
        this.validCount = this.domainsValid.length;
        this.textDomainsValid = this.domainsValid.map(item => item.name).join('\n');
        this.textDomains = response.respObject.invalidSites.join('\n');
        this.showProgressBar = false;
      }, (error: any) => {
        this.showProgressBar = false;
      });

  }


  // REVX-877 : targeting limit
  setError(show: boolean, msg: string) {
    this.showError = show;
    this.errorMsg = msg;
  }




}
