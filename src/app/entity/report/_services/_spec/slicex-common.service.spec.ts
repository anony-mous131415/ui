import { TestBed } from '@angular/core/testing';

import { SlicexCommonService } from '../slicex-common.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';

describe('SlicexCommonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  //mocking localstorage 
  beforeEach(() => {
    let store = {};
    const mockLocalStorage = {
      getItem: (key: string): string => {
        return key in store ? store[key] : null;
      },
      setItem: (key: string, value: string) => {
        store[key] = `${value}`;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      }
    };


    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
  });

  it('should be created', () => {
    const service: SlicexCommonService = TestBed.get(SlicexCommonService);
    expect(service).toBeTruthy();
  });


  //new-test cases
  it('should test updateFilters', () => {
    const service: SlicexCommonService = TestBed.get(SlicexCommonService);

    const inpBreadcrums = {
      k1: {
        values: [
          { id: 1, name: 'n1' },
          { id: 2, name: 'n2' }
        ]
      },

      k2: {
        values: [
          { id: 21, name: 'n3' },
          { id: 22, name: 'n4' }
        ]
      }

    }

    const expectation =
      [
        { column: 'k1', value: '1' },
        { column: 'k1', value: '2' },
        { column: 'k2', value: '21' },
        { column: 'k2', value: '22' },
      ];


    let result = service.getFilters(inpBreadcrums);
    expect(result).toEqual(expectation);
  });


  it('should test computeChange', () => {
    const service: SlicexCommonService = TestBed.get(SlicexCommonService);
    expect(service.computeChange(0, 0)).toEqual(null);
    expect(service.computeChange(1, 0)).toEqual(null);
    expect(service.computeChange(1, null)).toEqual(null);
    expect(service.computeChange(1, 2)).toEqual(100);
  });




  it('should test formatNumber', () => {
    const service: SlicexCommonService = TestBed.get(SlicexCommonService);
    localStorage.setItem(AppConstants.CACHED_CURRENCY, '$');
    expect(service.formatNumber(1, AppConstants.NUMBER_TYPE_CURRENCY, 'USD')).toEqual('$ 1');
    expect(service.formatNumber(1, AppConstants.NUMBER_TYPE_CURRENCY, '')).toEqual('$ 1');
    expect(service.formatNumber(1, AppConstants.NUMBER_TYPE_PERCENTAGE, '')).toEqual('1%');
    expect(service.formatNumber(1, undefined, '')).toEqual('1');
    expect(!service.formatNumber(null, undefined, '')).toEqual(true);
  });



});
