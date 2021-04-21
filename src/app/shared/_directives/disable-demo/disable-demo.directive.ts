import { Directive, Renderer2, ElementRef, Input, OnInit } from '@angular/core';
import { AppConstants } from '@app/shared/_constants/AppConstants';

@Directive({
  selector: '[appDisableDemo]'
})
export class DisableDemoDirective implements OnInit {

  @Input('appDisableDemo') inputProperty: string;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef
  ) { }


  ngOnInit() {
    const role = localStorage.getItem(AppConstants.CACHED_USER_ROLE);

    if (role === AppConstants.USER_ROLE.DEMO && this.inputProperty === AppConstants.HIDE) {
      this.renderer.setAttribute(this.el.nativeElement, 'hidden', 'true');
    } else if (role === AppConstants.USER_ROLE.DEMO && this.inputProperty === AppConstants.DISABLE) {
      this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'true');
      this.renderer.addClass(this.el.nativeElement, 'no-cursor-wrapper');
      this.renderer.addClass(this.el.nativeElement, 'demo-fade');
    }


  }

}
