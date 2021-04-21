import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CreativeConstants } from '@app/entity/creative/_constants/CreativeConstants';
import { CreativeDTO } from '@revxui/api-client-ts';


@Component({
  selector: 'app-cr-verify-modal',
  templateUrl: './cr-verify-modal.component.html',
  styleUrls: ['./cr-verify-modal.component.scss']
})
export class CrVerifyModalComponent implements OnInit {

  // @Output() clickVerification: EventEmitter<boolean> = new EventEmitter();

  iframeMouseOver: boolean;
  windowBlurred = false;
  windowHidden = false;
  clickVerified = false;

  vSelection: string;
  showSuccess = false;
  showFailed = false;

  crConst = CreativeConstants;

  constructor(
    private modalRef: MatDialogRef<CrVerifyModalComponent>,
    @Inject(MAT_DIALOG_DATA) private data: CreativeDTO,
  ) {

  }


  ngOnInit() {

    document.addEventListener(
      'visibilitychange'
      , () => {
        if (document.hidden) {
          this.windowHidden = true;
        } else {
          this.windowHidden = false;
        }
      }
    );
    // this.renderer.listen(window, 'blur', () => this.onWindowBlur());
  }

  @HostListener('window:focus', ['$event'])
  onfocus(event: FocusEvent): void {
    this.windowBlurred = false;
  }

  @HostListener('window:blur', ['$event'])
  onBlur(event: FocusEvent): void {
    // this.log('window blurred');
    this.windowBlurred = true;
    this.onWindowBlur();
  }

  @HostListener('mouseover')
  public onIframeMouseOver() {
    // this.log('Iframe mouse over');
    this.iframeMouseOver = true;
    this.resetFocusOnWindow();
  }

  @HostListener('mouseout')
  public onIframeMouseOut() {
    // this.log('Iframe mouse out');
    this.iframeMouseOver = false;
    this.resetFocusOnWindow();
  }

  private onWindowBlur() {
    this.log('blured ');
    if (this.iframeMouseOver) {
      // this.log('WOW! Iframe click!!!');
      setTimeout(() => {
        if (this.windowHidden === true) {
          // console.log('click verified');
          this.clickVerified = true;
        }
      }, 100);
      this.resetFocusOnWindow();
      // this.iframeClick.emit(this.el);
    }
  }

  private resetFocusOnWindow() {
    setTimeout(() => {
      // this.log('reset focus to window');
      window.focus();
      this.windowBlurred = false;
    }, 100);
  }

  private log(message: string) {
    // if (this.debug) {
    // console.log(message);
    // }
  }

  get creative() {
    // console.log('data ', this.data);
    return this.data;
  }

  onCancelClick() {
    this.modalRef.close(null);
  }

  onDoneClick() {
    // console.log( this.vSelection, this.vSelection === '1', this.clickVerified);
    if (this.vSelection === '1' && this.clickVerified === true) {

      // this.clickVerification.emit(this.clickVerified);
      this.modalRef.close(true);
    }
  }

  handleVerificationClick(event) {
    // console.log(this.vSelection, event.value === 1, event.value === '1');
    if (event.value === '1' && this.clickVerified === true) {
      this.showSuccess = true;
      this.showFailed = false;
    } else {
      this.showSuccess = false;
      this.showFailed = true;
    }
  }



  // clickToVerify() {
  //   console.log('clickHappend ', this.clickHappend);
  // }

}
