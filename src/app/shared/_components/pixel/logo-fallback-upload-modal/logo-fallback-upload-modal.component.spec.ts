import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoFallbackUploadModalComponent } from './logo-fallback-upload-modal.component';

describe('LogoFallbackUploadModalComponent', () => {
  let component: LogoFallbackUploadModalComponent;
  let fixture: ComponentFixture<LogoFallbackUploadModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogoFallbackUploadModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogoFallbackUploadModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
