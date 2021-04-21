import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetingModalComponent } from './targeting-modal.component';

describe('TargetingModalComponent', () => {
  let component: TargetingModalComponent;
  let fixture: ComponentFixture<TargetingModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TargetingModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
