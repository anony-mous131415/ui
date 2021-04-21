import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageGridModalComponent } from './image-grid-modal.component';

describe('ImageGridModalComponent', () => {
  let component: ImageGridModalComponent;
  let fixture: ComponentFixture<ImageGridModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageGridModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageGridModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
