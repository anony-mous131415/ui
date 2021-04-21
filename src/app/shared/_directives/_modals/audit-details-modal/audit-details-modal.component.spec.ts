import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditDetailsModalComponent } from './audit-details-modal.component';

describe('AuditDetailsModalComponent', () => {
  let component: AuditDetailsModalComponent;
  let fixture: ComponentFixture<AuditDetailsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuditDetailsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
