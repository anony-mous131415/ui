import { Component, Input, OnInit } from '@angular/core';
import { CreativeConstants } from '@app/entity/creative/_constants/CreativeConstants';
import { CreativeDetails } from '@revxui/api-client-ts';

@Component({
  selector: 'app-cr-create-vast-form',
  templateUrl: './cr-create-vast-form.component.html',
  styleUrls: ['./cr-create-vast-form.component.scss']
})
export class CrCreateVastFormComponent implements OnInit {

  @Input() label: string;
  @Input() tooltip: string;
  @Input() tooltipPosition: string;
  @Input() id: string;
  @Input() name: string;
  @Input() validationMsg: string;
  @Input() validated: string;
  @Input() placeholder: string;
  @Input() maxLen: string;
  @Input() minLen: string;
  @Input() width: string;
  @Input() disable: string;
  @Input() type: string;
  @Input() formValidated: string;


  @Input() textBefore: string;
  @Input() textAfter: string;
  @Input() marginBottom: string;
  @Input() videoSizeHeight:string;
  @Input() videoSizeWidth: string

  crConst = CreativeConstants

  val = '';
  value: any
  onChange: any = () => { };
  onTouch: any = () => { };

  crBasicDetails = {} as CreativeDetails;
  crObj: any = {
    vastVideoFormatSelected: 'mp4',
    vastVideoFormats: JSON.stringify([
      { id: 'mp4', value: 'MP4' },
      { id: 'flv', value: 'FLV' }
    ]),
  };

  constructor() { }

  ngOnInit() {
  }

}
