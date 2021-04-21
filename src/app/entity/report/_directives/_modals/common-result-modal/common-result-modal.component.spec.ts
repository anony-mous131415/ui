import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonResultModalComponent } from './common-result-modal.component';

describe('CommonResultModalComponent', () => {
  let component: CommonResultModalComponent;
  let fixture: ComponentFixture<CommonResultModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonResultModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonResultModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
