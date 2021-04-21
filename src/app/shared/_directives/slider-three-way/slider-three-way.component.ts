import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

type PaneType = 1 | 2 | 3;

@Component({
  selector: 'app-slider-three-way',
  templateUrl: './slider-three-way.component.html',
  styleUrls: ['./slider-three-way.component.scss'],

  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slide', [
      state('left', style({ transform: 'translateX(0)' })),
      state('center', style({ transform: 'translateX(0)' })),
      state('right', style({ transform: 'translateX(0)' })),
      transition('* => *', animate(300))
    ])
  ]
})
export class SliderThreeWayComponent {

  @Input() public activePane: PaneType = 1;
  constructor() { }

}
