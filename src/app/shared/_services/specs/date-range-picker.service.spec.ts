import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { DateRange } from '@app/shared/_models/date.range.model';
import { DateRangePickerService } from '../date-range-picker.service';

describe('DateRangePickerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), RouterTestingModule]
    }));


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

  it('DateRangePicker should be created', () => {
    const service: DateRangePickerService = TestBed.get(DateRangePickerService);
    expect(service).toBeTruthy();
  });

  it('formatDate', () => {
    let service = TestBed.get(DateRangePickerService);
    let inputdate = new Date('Tue Oct 15 2019 20:00:00 GMT+0530 (India Standard Time)');
    let outputdate = '15 Oct 2019';
    let result = service.formatDate(inputdate);
    expect(result).toEqual(outputdate);
  });

  it('should test getDateRange ', () => {
    let service = TestBed.get(DateRangePickerService);
    let startdate = 2;
    let enddate = 1;
    let result = service.getDateRange(startdate, enddate);
    let diffcheck = (result.endDateEpoch - result.startDateEpoch) / (3600 * 24);
    expect(diffcheck).toEqual(startdate);
  });

  it('cache date', () => {
    let service = TestBed.get(DateRangePickerService);
    let result = service.getCachedDateRange();
    expect(result).toBeTruthy();
  });


  //new test cases
  it('should test getCachedDateRange', () => {
    let service = TestBed.get(DateRangePickerService);
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
    let service = TestBed.get(DateRangePickerService);

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


});
