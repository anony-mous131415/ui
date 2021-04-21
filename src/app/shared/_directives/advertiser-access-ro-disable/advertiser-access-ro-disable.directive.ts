import { Directive, Renderer2, ElementRef, OnInit } from '@angular/core';
import { AppConstants } from '@app/shared/_constants/AppConstants';

@Directive({
  selector: '[appAdvertiserAccessRoDisable]'
})
export class AdvertiserAccessRoDisableDirective implements OnInit{

  constructor(private renderer: Renderer2,
    private el: ElementRef) { }

  ngOnInit() {

    const role = localStorage.getItem(AppConstants.CACHED_USER_ROLE);
    const hasOneAdv = localStorage.getItem(AppConstants.USER_HAS_ADVERTISER_ACCESS);

    if (role === AppConstants.USER_ROLE.READ_ONLY && hasOneAdv === AppConstants.POSITIVE) {
      this.renderer.setAttribute(this.el.nativeElement, 'hidden', 'true');
    }

  }


}
