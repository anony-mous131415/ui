import { ChangeDetectorRef, Component, Input, OnInit, Optional, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AudienceConstants } from '@app/entity/audience/_constants/AudienceConstants';
import { AudienceService } from '@app/entity/audience/_services/audience.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RuleDTO } from '@revxui/api-client-ts';

@Component({
  selector: 'app-audience-rules',
  templateUrl: './audience-rules.component.html',
  styleUrls: ['./audience-rules.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class AudienceRulesComponent implements OnInit {

  inputRuleResp: any;
  rulesMList: any[] = [];

  audConst = AudienceConstants;
  formValidated: boolean = true;
  errMsg: string;

  ruleToBeEdited: any;
  @Input() testRuleDto: RuleDTO;

  selectedRules: string[];
  arr = [];

  public form: FormGroup;
  private fb: FormBuilder;
  objective: any[] = [];

  constructor(
    fb: FormBuilder,
    private audService: AudienceService,
    @Optional() private readonly activeModal: NgbActiveModal,
    private cdRef: ChangeDetectorRef) {

    this.fb = fb;
    this.form = this.fb.group({
      rules: this.fb.array([])
    });
  }

  ruleSelectorHandler(index) {
    let rules = this.getRules();
    let ruleArr = rules.value;
    let f = ruleArr[index].filter;

    let o, v;

    o = this.rulesMList[0][f - 1].ruleOperators[0].id;
    if (this.rulesMList[0][f - 1].ruleValues.length)
      v = this.rulesMList[0][f - 1].ruleValues[0].value;
    else
      v = '*';

    rules.removeAt(index);

    rules.insert(index, this.fb.group({
      filter: [f],
      operator: [o],
      val: [v]
    }));

    // this.selectedRules = this.rulesMList[0];
    this.arr[index] = this.rulesMList[0];
  }


  // ngOnInit() {
  //   this.audService.getRules().subscribe(resp => {
  //       if (resp && resp.respObject) {
  //       this.rulesMList.push(resp.respObject.metaRules);
  //       this.selectedRules = this.rulesMList[0];
  //       if (this.ruleToBeEdited) {
  //         this.editForm();
  //       } else {
  //         this.addRule();
  //       }
  //     }
  //   });
  // }
  ngOnInit() {
    this.rulesMList.push(this.inputRuleResp.respObject.metaRules);
    this.selectedRules = this.rulesMList[0];
    if (this.ruleToBeEdited) {
      this.editForm();
    } else {
      this.addRule();
    }

  }

  editForm() {
    let rules = this.getRules();
    for (let i = 0; i < this.ruleToBeEdited.length; i++) {
      this.arr.push(this.selectedRules);

      rules.push(this.fb.group({
        filter: [this.ruleToBeEdited[i].filter],
        operator: [this.ruleToBeEdited[i].operator],
        val: [this.ruleToBeEdited[i].val]
      }));

    }

  }


  addRule(): void {
    let rules = this.getRules();
    if (rules.length < 16) {
      this.arr.push(this.selectedRules);

      rules.push(this.fb.group({
        filter: [this.rulesMList[0][0].id],
        operator: [this.rulesMList[0][0].ruleOperators[0].id],
        val: ['*'],
      }));
    }
  }

  isAndRequired(i: any) {
    return i > 0;


  }
  getRules(): FormArray {
    return (this.form.get("rules") as FormArray);
  }

  removeRule(rule: FormControl, index: number): void {
    if (this.getRules().length > 1) {
      this.removeFromCollection(this.getRules(), rule);
      this.arr.splice(index, 1);
    }
  }

  private removeFromCollection(collection: FormArray, item: FormControl): void {
    collection.removeAt(collection.controls.indexOf(item));
  }

  getRuleOperators(index, query?: string) {
    let rules = this.getRules();
    let ruleArr = rules.value;
    let filterId = ruleArr[index].filter;
    return this.rulesMList[0][filterId - 1].ruleOperators
  }

  isRuleValues(index) {
    let rules = this.getRules();
    let ruleArr = rules.value;
    let filterId = ruleArr[index].filter;
    if (this.rulesMList[0][filterId - 1].ruleValues.length) {
      return true;
    }
    return false;
  }

  getRuleValues(index) {
    let rules = this.getRules();
    let ruleArr = rules.value;
    let filterId = ruleArr[index].filter;
    return this.rulesMList[0][filterId - 1].ruleValues;
  }

  done() {
    this.processForm(this.form);
    if (this.formValidated) {
      this.activeModal.close(this.objective);
    }
  }

  dismissModal() {
    if (!this.ruleToBeEdited) {
      this.activeModal.close();
    } else {
      this.processForm(this.form);
      if (this.formValidated) {
        this.activeModal.close(this.objective);
      }
    }
  }

  processForm(form: FormGroup): void {
    //this method sets the objective to be returned
    this.validateUI();
    if (this.formValidated) {
      this.objective = form.value.rules;
      // console.log(this.objective);
    } else {
      this.objective = null;
    }
  }

  validateUI() {
    this.formValidated = true;
    let ruleArr = this.getRules().value;
    for (let i = 0; i < ruleArr.length; i++) {
      let element = ruleArr[i]
      if ((element.filter === 1 || (element.filter >= 13 && element.filter <= 15)) && !element.val) {
        // no value for URL or any feild which has input
        this.errMsg = 'Condition ' + (i + 1) + ' : Value cannot be empty.'
        this.formValidated = false;
        return;
      } else if (element.filter >= 13 && element.filter <= 15 && isNaN(element.val)) {
        // non-numeric value for Txn-amt , price or selling Price
        this.errMsg = 'Condition ' + (i + 1) + ' : Value should be a number.'
        this.formValidated = false;
        return;
      }
    }
  }

  //below 3 methods are used to filter fropdown-1
  search(event, index: number, dropDownNum: number) {
    // console.log(index);
    let query = event.target.value;
    let result;
    if (dropDownNum == 0) {
      result = this.selectFilter(query, dropDownNum);
      this.arr[index] = result;
    } else if (dropDownNum == 1) {
      this.getRuleOperators(index, query);
    }
  }

  selectFilter(query: string, dropDownNum: number): string[] {
    let result: string[] = [];
    if (dropDownNum == 0) {
      for (let a of this.rulesMList[0]) {
        if (a.displayName.toLowerCase().indexOf(query.toLowerCase()) > -1) {
          result.push(a)
        }
      }
      return result;
    }
  }

  resetFilterList(index: number) {
    // console.log('reset called..');
    this.arr[index] = this.rulesMList[0];
  }




}
