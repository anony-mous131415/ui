import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrCreateUpdateThemeModalComponent } from './cr-create-update-theme-modal.component';

describe('CrCreateUpdateThemeModalComponent', () => {
  let component: CrCreateUpdateThemeModalComponent;
  let fixture: ComponentFixture<CrCreateUpdateThemeModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrCreateUpdateThemeModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrCreateUpdateThemeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
