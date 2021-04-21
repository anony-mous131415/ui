import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignObjectiveModalComponent } from './campaign-objective-modal.component';

describe('CampaignObjectiveModalComponent', () => {
  let component: CampaignObjectiveModalComponent;
  let fixture: ComponentFixture<CampaignObjectiveModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CampaignObjectiveModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignObjectiveModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
