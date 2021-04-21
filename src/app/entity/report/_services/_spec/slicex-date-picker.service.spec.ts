import { TestBed } from '@angular/core/testing';

import { SlicexDatePickerService } from '../slicex-date-picker.service';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { DateRange } from '@app/shared/_models/date.range.model';

describe('SlicexDatePicker.Service.TsService', () => {
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
    const service: SlicexDatePickerService = TestBed.get(SlicexDatePickerService);
    expect(service).toBeTruthy();
  });


  //new-tests
  it('should test getDateRange ', () => {
    let service = TestBed.get(SlicexDatePickerService);
    let startdate = 2;
    let enddate = 1;
    let result = service.getDateRange(startdate, enddate);
    let diffcheck = (result.endDateEpoch - result.startDateEpoch) / (3600 * 24);
    expect(diffcheck).toEqual(startdate);
  });

  it('should test getCachedDateRange', () => {
    let service = TestBed.get(SlicexDatePickerService);
    const cachedDate = {
      endDate: "2020-08-23T18:30:00.000Z",
      endDateEpoch: 1598313600,
      startDate: "2020-08-17T18:30:00.000Z",
      startDateEpoch: 1597708800
    }

    localStorage.setItem(AppConstants.CACHED_DATE_RANGE, JSON.stringify(cachedDate));
    let outputOfLocalStorage = JSON.parse(localStorage.getItem(AppConstants.CACHED_DATE_RANGE));
    let expextedDate: DateRange = {
      startDate: new Date(outputOfLocalStorage.startDate),
      endDate: new Date(outputOfLocalStorage.endDate),
      endDateEpoch: outputOfLocalStorage.endDateEpoch,
      startDateEpoch: outputOfLocalStorage.startDateEpoch

    }
    let result = service.getCachedDateRange();
    expect(result).toEqual(expextedDate);
  });

  it('should test getDateRangeFromDate', () => {
    let service = TestBed.get(SlicexDatePickerService);

    const inputDate = new Date();
    const minusInStartDate = 2;
    const minusInEndDate = 1;

    const expectedStartDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate() - minusInStartDate);
    const expectedEndDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate() - minusInEndDate);

    const expectedDR: DateRange = {
      startDate: expectedStartDate,
      endDate: expectedEndDate,
      startDateEpoch: Date.UTC(expectedStartDate.getFullYear(), expectedStartDate.getMonth(), expectedStartDate.getDate()) / 1000,
      endDateEpoch: Date.UTC(expectedEndDate.getFullYear(), expectedEndDate.getMonth(), expectedEndDate.getDate()) / 1000 + 86400
    }

    let result = service.getDateRangeFromDate(inputDate, minusInStartDate, minusInEndDate);
    expect(result).toEqual(expectedDR);
  });


  it('should test formatDate', () => {
    let service = TestBed.get(SlicexDatePickerService);

    let date1 = new Date(2020, 1, 1);
    let date2 = new Date(2020, 2, 2);

    //expect UTC dates not local
    expect(service.formatDate(date1)).toEqual('31 Jan 2020');
    expect(service.formatDate(date2)).toEqual('1 Mar 2020');
  });



});
