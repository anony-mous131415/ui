import { Injectable, ElementRef, Renderer } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HrefInterceptorService {

  constructor(elementRef: ElementRef, renderer: Renderer) {

    renderer.listen(elementRef.nativeElement, 'click', (event) => {
        event.preventDefault();
        let target = event.target || event.srcElement || event.currentTarget;
        console.log(target);

    });


}

  // constructor() {
  //   document.onclick = this.interceptHref;
  // }

  // interceptHref(_event) {
  //   console.log('insfaf');
  //   const tEvent = _event || window.event;

  //   const element = tEvent.target || tEvent.srcElement;

  //   if (element.tagName === 'A') {

  //     console.log('intercept!');

  //     return false; // prevent default action and stop event propagation
  //   }
  // }
}
