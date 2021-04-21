import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DashboardControllerService } from '@revxui/api-client-ts';


const IOS_ID = 3;
const ANDROID_ID = 4;


@Component({
  selector: 'app-os-version-modal',
  templateUrl: './os-version-modal.component.html',
  styleUrls: ['./os-version-modal.component.scss']
})
export class OsVersionModalComponent implements OnInit {

  // androidVersionOptions = [
  //   { id: 21, name: 'Any' },
  //   { id: 1, name: '2' },
  //   { id: 2, name: '2.1' },
  //   { id: 3, name: '2.2' },
  //   { id: 4, name: '2.3' },
  //   { id: 5, name: '3' },
  //   { id: 6, name: '3.1' },
  //   { id: 7, name: '3.2' },
  //   { id: 8, name: '4' },
  //   { id: 9, name: '4.1' },
  //   { id: 10, name: '4.2' },
  //   { id: 11, name: '4.3' },
  //   { id: 12, name: '4.4' },
  //   { id: 24, name: '5' },
  //   { id: 25, name: '5.1' },
  //   { id: 26, name: '6' },
  //   { id: 27, name: '7' },
  //   { id: 28, name: '7.1' }
  // ];

  // iosVersionOptions = [
  //   { id: 23, name: 'Any' },
  //   { id: 13, name: '2' },
  //   { id: 14, name: '3' },
  //   { id: 15, name: '4' },
  //   { id: 16, name: '4.3' },
  //   { id: 17, name: '5' },
  //   { id: 18, name: '6' },
  //   { id: 19, name: '7' },
  //   { id: 20, name: '7.1' },
  //   { id: 29, name: '8' },
  //   { id: 30, name: '8.1' },
  //   { id: 31, name: '8.2' },
  //   { id: 32, name: '8.3' },
  //   { id: 33, name: '8.4' },
  //   { id: 34, name: '9' },
  //   { id: 35, name: '9.1' },
  //   { id: 36, name: '9.2' },
  //   { id: 37, name: '9.3' },
  //   { id: 41, name: '10' },
  //   { id: 38, name: '10.1' },
  //   { id: 39, name: '10.2' },
  //   { id: 40, name: '10.3' }
  // ];

  androidVersionOptions: any[] = [];
  iosVersionOptions: any[] = [];

  selAndroidVersion: any = 'Any';
  selIOSVersion: any = 'Any';
  showProgressBar: boolean;

  constructor(
    private modalRef: MatDialogRef<OsVersionModalComponent>,
    @Inject(MAT_DIALOG_DATA) private configData: any,
    private dashboardService: DashboardControllerService
  ) { }

  ngOnInit() {
    this.fetchOsVersions();
  }



  //REVX-1176 fetching version from api
  fetchOsVersions() {

    this.androidVersionOptions = [];
    this.iosVersionOptions = [];
    this.showProgressBar = true;

    this.dashboardService.getDetailDictionaryUsingPOST("OS_VERSION", 1, 100).subscribe(resp => {
      if (resp && resp.respObject && resp.respObject.data && resp.respObject.data.length > 0) {
        let data: any[] = resp.respObject.data;
        data.forEach(x => {
          if (x && x.osId === IOS_ID) {
            if (x.id === 23) {
              x.name = "Any";
            }
            this.iosVersionOptions.push(x);
          } else if (x && x.osId === ANDROID_ID) {
            if (x.id === 21) {
              x.name = "Any";
            }
            this.androidVersionOptions.push(x);
          }
        })
      }
      this.selAndroidVersion = this.configData.osVersionAndroid.name;
      this.selIOSVersion = this.configData.osVersionIOS.name;
      this.showProgressBar = false;
    }, (error) => {
      this.selAndroidVersion = this.configData.osVersionAndroid.name;
      this.selIOSVersion = this.configData.osVersionIOS.name;
      this.showProgressBar = false;
    });
  }

  get config() {
    return this.configData;
  }

  onSaveClick() {
    const andIdx = this.androidVersionOptions.findIndex(item => item.name === this.selAndroidVersion);
    const andVersion = (andIdx !== -1) ? this.androidVersionOptions[andIdx] : { id: 21, name: 'Any' };

    const iosIdx = this.iosVersionOptions.findIndex(item => item.name === this.selIOSVersion);
    const iOSVersion = (andIdx !== -1) ? this.iosVersionOptions[iosIdx] : { id: 23, name: 'Any' };

    this.modalRef.close({
      ...this.configData,
      androidVersion: andVersion,
      iosVersion: iOSVersion
    });
  }

  onCancelClick() {
    this.modalRef.close(null);
  }


}