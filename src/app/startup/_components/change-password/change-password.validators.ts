import { AbstractControl, ValidationErrors } from '@angular/forms';

export const SecretKeyStrengthValidator = function (control: AbstractControl): ValidationErrors | null {

  const value: string = control.value || '';

  if (!value) {
    return null;
  }

  const upperCaseCharacters = /[A-Z]+/g
  if (upperCaseCharacters.test(value) === false) {
    return { secretKeyStrength: `Passoword should contains atleast 1 upper case character` };
  }

  const lowerCaseCharacters = /[a-z]+/g
  if (lowerCaseCharacters.test(value) === false) {
    return { secretKeyStrength: `Passoword should contains atleast 1 lower case character` };
  }


  const numberCharacters = /[0-9]+/g
  if (numberCharacters.test(value) === false) {
    return { secretKeyStrength: `Passoword should contains atleast 1 number character` };
  }

  const specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/
  if (specialCharacters.test(value) === false) {
    return { secretKeyStrength: `Passoword should contains atleast 1 special character` };
  }
  return null;
}