import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CdTextAreaComponent } from './cd-text-area.component';

describe('CdTextAreaComponent', () => {
  let component: CdTextAreaComponent;
  let fixture: ComponentFixture<CdTextAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CdTextAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CdTextAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
