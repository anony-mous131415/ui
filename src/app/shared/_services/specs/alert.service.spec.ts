import { TestBed } from '@angular/core/testing';

import { AlertService } from '../alert.service';
import { RouterModule } from '@angular/router';
import { CSSThemeController_Service } from '@revxui/api-client-ts';
import { APP_BASE_HREF } from '@angular/common';

describe('AlertService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [RouterModule.forRoot([]),],
    providers: [
      { provide: APP_BASE_HREF, useValue: '/' },
      CSSThemeController_Service
    ]
  }));

  it('should be created', () => {
    const service: AlertService = TestBed.get(AlertService);
    expect(service).toBeTruthy();
  });
});
