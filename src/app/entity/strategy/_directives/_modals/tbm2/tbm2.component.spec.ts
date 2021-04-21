import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Tbm2Component } from './tbm2.component';

describe('Tbm2Component', () => {
  let component: Tbm2Component;
  let fixture: ComponentFixture<Tbm2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Tbm2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Tbm2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
