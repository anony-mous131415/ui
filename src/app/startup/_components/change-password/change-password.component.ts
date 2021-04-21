import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MatIcon } from '@angular/material';
import { AlertMessageConstants } from '@app/shared/_constants/alert-message.constants';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { BlockUIConstants } from '@app/shared/_constants/BlockUIConstants';
import { AlertService } from '@app/shared/_services/alert.service';
import { AuthenticationService } from '@app/startup/_services/authentication.service';
import { PasswordChangeRequest } from '@revxui/auth-client-ts';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Md5 } from 'ts-md5/dist/md5';
import { SecretKeyStrengthValidator } from './change-password.validators';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;

  appConst = AppConstants;

  oldPassFormControl: FormControl;
  newPassFormControl: FormControl;
  verifyPassFormControl: FormControl;

  newSecretKeyError = '';
  oldSecretKeyError = '';

  hide1 = false;
  hide2 = false;
  hide3 = false;

  request = {} as PasswordChangeRequest;
  constructor(
    public dialogRef: MatDialogRef<ChangePasswordComponent>,
    private authUIService: AuthenticationService,
    private alertService: AlertService,
  ) { }

  showDetails: boolean;

  ngOnInit() {

    this.oldPassFormControl = new FormControl('', [
      Validators.required,
    ]);

    this.newPassFormControl = new FormControl('', [
      Validators.required,
      SecretKeyStrengthValidator,
      Validators.minLength(8)
    ]);

    this.verifyPassFormControl = new FormControl('', [
      Validators.required,
    ]);

  }

  dismissModal() {
    // this.activeModal.close();
    this.dialogRef.close();
  }

  onSubmit() {

    // console.log('on submit called', this.oldPassFormControl, this.newPassFormControl);
    this.newSecretKeyError = '';
    this.oldSecretKeyError = '';

    if (!this.validatePasswords()) {
      return;
    }

    const md5 = new Md5();
    this.request.oldPassword = md5.appendStr(this.oldPassFormControl.value).end().toString();

    const md5Hash = new Md5();
    this.request.newPassword = md5Hash.appendStr(this.newPassFormControl.value).end().toString();

    // console.log('old password ', this.request.oldPassword);
    // console.log('new password ', this.request.newPassword);

    this.request.username = localStorage.getItem(AppConstants.CACHED_USERNAME);

    this.blockUI.start(BlockUIConstants.CHANGE_SECRET_KEY_MSG);
    this.authUIService.changePassword(this.request).subscribe(
      apiResponse => {
        console.log('apiResponse ', apiResponse);
        if (apiResponse.respObject === true) {
          this.alertService.success(AlertMessageConstants.SECRET_KEY_CHANGED_SUCCESS_MSG);
          this.dismissModal();
          this.blockUI.stop();
        } else {
            this.oldSecretKeyError = 'Old password do not match';
            this.blockUI.stop();
        }
      },
      catchError => {
        if (catchError.error !== null && catchError.error.error !== null) {
          this.oldSecretKeyError = catchError.error.error.message;
        }
        this.blockUI.stop();
      }
    );
  }

  validatePasswords() {
    if (!this.oldPassFormControl.value || !this.newPassFormControl.value || !this.verifyPassFormControl.value) {
      return false;
    }

    if (this.newPassFormControl.hasError('secretKeyStrength') ||
      this.newPassFormControl.hasError('required') || this.newPassFormControl.hasError('minlength')) {
      return false;
    }
    // check password matched or not
    if (this.newPassFormControl.value !== this.verifyPassFormControl.value) {
      this.newSecretKeyError = 'New password and Confirmation password should be same';
      return false;
    }

    if (this.oldPassFormControl.value === this.newPassFormControl.value) {
      this.newSecretKeyError = 'Old password and new password should not be same';
      return false;
    }

    return true;
  }


}
