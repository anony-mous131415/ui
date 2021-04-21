import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrDropDownComponent } from './cr-drop-down.component';

describe('CrDropDownComponent', () => {
  let component: CrDropDownComponent;
  let fixture: ComponentFixture<CrDropDownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrDropDownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrDropDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
