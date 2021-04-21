import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'pixelType'
})
export class PixelTypePipe implements PipeTransform {

  pixelType = new Map();

  setPixelType() {
    this.pixelType.set('VIEW_CONV', 'View Conversions');
    this.pixelType.set('CLICK_CONV', 'Click Conversions');
    this.pixelType.set('HYBRID_CONV', 'Hybrid');
  }

  transform(type: string): string {
    this.setPixelType();
    return this.pixelType.get(type);
  }

}
