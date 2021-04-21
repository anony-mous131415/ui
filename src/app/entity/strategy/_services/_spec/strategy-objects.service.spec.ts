import { TestBed } from '@angular/core/testing';

import { StrategyObjectsService } from '../strategy-objects.service';

describe('StrategyObjectsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StrategyObjectsService = TestBed.get(StrategyObjectsService);
    expect(service).toBeTruthy();
  });
});
