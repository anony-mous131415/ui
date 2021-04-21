import { Directive, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { AppConstants } from '@app/shared/_constants/AppConstants';

@Directive({
  selector: '[appDisableRO]'
})
export class DisableRoDirective implements OnInit {

  constructor(
    private renderer: Renderer2,
    private el: ElementRef
  ) { }

  ngOnInit() {

    const role = localStorage.getItem(AppConstants.CACHED_USER_ROLE);
    if (role === AppConstants.USER_ROLE.READ_ONLY) {
      this.renderer.setAttribute(this.el.nativeElement, 'hidden', 'true');
    }

    // switch (role) {
    //   case AppConstants.USER_ROLE.READ_ONLY:
    //     //hide create buttons from menucrumbs
    //     this.renderer.setAttribute(this.el.nativeElement, 'hidden', 'true');
    //     break;

    //   case AppConstants.USER_ROLE.DEMO:
    //     //disable 'save' buttons on create-page , (activate/deactivate/edit/import) buttons on details and lists
    //     this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'true');
    //     this.el.nativeElement.style.cursor = 'not-allowed';
    //     break;
    // }


  }

}