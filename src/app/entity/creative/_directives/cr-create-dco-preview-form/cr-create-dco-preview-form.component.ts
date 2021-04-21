import { Component, Input, OnInit } from '@angular/core';
import { CreativeConstants } from '@app/entity/creative/_constants/CreativeConstants';
import * as data from './creatives-mockups-reponse.json';

@Component({
  selector: 'app-cr-create-dco-preview-form',
  templateUrl: './cr-create-dco-preview-form.component.html',
  styleUrls: ['./cr-create-dco-preview-form.component.scss']
})
export class CrCreateDcoPreviewFormComponent implements OnInit {

  @Input() formValidated: string;
  value:any;

  crConst = CreativeConstants;
  creativeMockups: any = (data as any).default;
  // creativeDto = {} as CreativeDTO;

  dco: any = {
    slots: '',
    marcoList: ''
  };

  native: any = {
    title: '',
    body: '',
    callToAction: '',
    icon: ''
  };

  creativeUIPreview: any = {
    nativeImageList: [],
    nonNativeHTMLList: [],
  };

  nonNativeHTMLList: string;
  nativeImageList: string;

  // dcoCreativeUIPreview = {
  //   nativeImageList: [],
  //   nonNativeHTMLList: []
  // };

  constructor(
    // private crService: CreativeService
  ) { }

  ngOnInit() {
    // console.log('creativeUIPreview ', this.creativeUIPreview);
    this.convertCreativeMockupListToUIPreviewObj();
  }

  // watch and destroy creative preview object

  convertCreativeMockupListToUIPreviewObj() {
    const mockupList = this.creativeMockups.data;
    for (const i in mockupList) {
      // if (mockupList[i].dco === false) {
        if (mockupList[i].native === false) {
         if (mockupList[i].type === 'html') {
            this.creativeUIPreview.nonNativeHTMLList.push(mockupList[i]);
            this.nonNativeHTMLList = JSON.stringify(this.creativeUIPreview.nonNativeHTMLList);
          }
        } else {
          if (mockupList[i].type === 'image') {
            this.creativeUIPreview.nativeImageList.push(mockupList[i]);
            this.nativeImageList = JSON.stringify(this.creativeUIPreview.nativeImageList);
          }
        }
      // }
      //  else {
      //   if (mockupList[i].native === false) {
      //     if (mockupList[i].type === 'html') {
      //       this.dcoCreativeUIPreview.nonNativeHTMLList.push(mockupList[i]);
      //     }
      //   } else {
      //     if (mockupList[i].type === 'html') {
      //       this.dcoCreativeUIPreview.nativeImageList.push(mockupList[i]);
      //     }
      //   }
      // }
    }


    // this.crService.updateCreativePreviewObj(this.creativeUIPreview);


    // console.log('creativeUIPreview', this.creativeUIPreview);
    // console.log('dcoCreativeUIPreview ', this.dcoCreativeUIPreview);
  }


}
