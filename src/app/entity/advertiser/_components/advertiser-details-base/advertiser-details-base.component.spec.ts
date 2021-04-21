import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvertiserDetailsBaseComponent } from './advertiser-details-base.component';

describe('AdvertiserDetailsBaseComponent', () => {
  let component: AdvertiserDetailsBaseComponent;
  let fixture: ComponentFixture<AdvertiserDetailsBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvertiserDetailsBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvertiserDetailsBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
