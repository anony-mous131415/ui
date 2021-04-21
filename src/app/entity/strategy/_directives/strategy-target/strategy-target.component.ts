import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-strategy-target',
  templateUrl: './strategy-target.component.html',
  styleUrls: ['./strategy-target.component.scss']
})
export class StrategyTargetComponent implements OnInit {

  @Input() identifier: string;
  @Input() icon: string;
  @Input() actionBtnLabel: string;
  @Input() options: any[];
  @Input() showDesc: boolean;

  @Output() actionBtnClick: EventEmitter<string> = new EventEmitter();
  @Output() selectionChange: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  onCheckboxChange(event, option) {
    option.checked = event.checked;
    this.selectionChange.emit(this.identifier);
  }

  onClickBrowse() {
    this.actionBtnClick.emit(this.identifier);
  }

}
