import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyBulkEditComponent } from './strategy-bulk-edit.component';

describe('StrategyBulkEditComponent', () => {
  let component: StrategyBulkEditComponent;
  let fixture: ComponentFixture<StrategyBulkEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrategyBulkEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyBulkEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
