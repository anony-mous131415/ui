import { async, TestBed } from '@angular/core/testing';
import * as STUB from '@app/shared/StubClasses';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { CommonService } from '@app/shared/_services/common.service';
import { ApiResponseObjectSlicexListResponse, SlicexGridData } from '@revxui/api-client-ts';
import { ListData, RawListData, SlicexListService } from '../slicex-list.service';



const slicexGridData: SlicexGridData[] = [
  { id: 21, advRevenue: 1, bidsPlaced: 2, clickConversions: 3 },
  { id: 41, advRevenue: 4, bidsPlaced: 5, clickConversions: 6 }
];


describe('SlicexListService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      { provide: CommonService, useClass: STUB.CommonService_stub },
    ]
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


  it('should be created', () => {
    const service: SlicexListService = TestBed.get(SlicexListService);
    expect(service).toBeTruthy();
  });


  //new-tests
  it('should test computeChange', () => {
    const service: SlicexListService = TestBed.get(SlicexListService);
    expect(service.computeChange(0, 0)).toEqual(null);
    expect(service.computeChange(1, 0)).toEqual(null);
    expect(service.computeChange(1, null)).toEqual(null);
    expect(service.computeChange(1, 2)).toEqual(100);
  });



  it('should test sortEntityData', async(() => {
    const service: SlicexListService = TestBed.get(SlicexListService);
    const expectation = { entity: 'a', metric: 'b', sortOrder: 'c', updateGridData: true }

    service.onSortEntityData.subscribe(received => {
      expect(received).toEqual(expectation);
    })
    service.sortEntityData('a', 'b', 'c');
  }));



  it('should test updateFilters', async(() => {
    const service: SlicexListService = TestBed.get(SlicexListService);

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

    const expectation = {
      breadcrumbs: inpBreadcrums,
      filters: [
        { column: 'k1', value: '1' },
        { column: 'k1', value: '2' },
        { column: 'k2', value: '21' },
        { column: 'k2', value: '22' },
      ]
    };


    service.onFiltersUpdated.subscribe(received => {
      expect(received).toEqual(expectation)
    });

    service.updateFilters(inpBreadcrums);

  }));


  it('should test onExportEntityGridData', async(() => {
    const service: SlicexListService = TestBed.get(SlicexListService);
    const expectation = { entity: 'str' }

    service.onEntityGridDataExport.subscribe(received => {
      expect(received).toEqual(expectation);
    })
    service.onExportEntityGridData('str');
  }));

  it('should test onEntitySelectionClear', async(() => {
    const service: SlicexListService = TestBed.get(SlicexListService);
    const expectation = { entity: 'ent', entityID: 123 }

    service.onClearEntitySelection.subscribe(received => {
      expect(received).toEqual(expectation);
    })
    service.onEntitySelectionClear('ent', 123);
  }));

  it('should test onUpdateEntitySelections', async(() => {
    const service: SlicexListService = TestBed.get(SlicexListService);

    const inpurArgs = slicexGridData;
    const expectation = {
      entity: 'ent',
      selections: [21, 41]
    };
    service.onUpdateEntitySelection.subscribe(received => {
      expect(received).toEqual(expectation);
    })
    service.onUpdateEntitySelections('ent', inpurArgs);
  }));

  it('should test onCloseEntityGridDetails', async(() => {
    const service: SlicexListService = TestBed.get(SlicexListService);

    const inpurArgs: SlicexGridData[] = [
      { id: 21, advRevenue: 1, bidsPlaced: 2, clickConversions: 3 },
      { id: 41, advRevenue: 4, bidsPlaced: 5, clickConversions: 6 }
    ];

    const expectation = {
      entity: 'ent',
      selection: inpurArgs,
      selectionChanged: false
    };

    service.onEntityGridDetailsClose.subscribe(received => {
      expect(received).toEqual(expectation);
    })
    service.onCloseEntityGridDetails('ent', inpurArgs, false);
  }));

  it('should test onForceExpandEntityGridDetails', async(() => {
    const service: SlicexListService = TestBed.get(SlicexListService);

    const inpurArgs: SlicexGridData[] = [
      { id: 21, advRevenue: 1, bidsPlaced: 2, clickConversions: 3 },
      { id: 41, advRevenue: 4, bidsPlaced: 5, clickConversions: 6 }
    ];

    const expectation = {
      entity: 'ent',
      sortOrder: 'ASC' as any,
      data: inpurArgs,
      selections: [1, 2, 3],
      orderMetric: 'metric'
    };

    service.onEntityGridDetailsForceExpand.subscribe(received => {
      expect(received).toEqual(expectation);
    })
    service.onForceExpandEntityGridDetails('ent', 'ASC', inpurArgs, [1, 2, 3], 'metric');
  }));

  it('should test onOpenEntityGridDetails', async(() => {
    const service: SlicexListService = TestBed.get(SlicexListService);

    const inpurArgs: SlicexGridData[] = [
      { id: 21, advRevenue: 1, bidsPlaced: 2, clickConversions: 3 },
      { id: 41, advRevenue: 4, bidsPlaced: 5, clickConversions: 6 }
    ];

    const expectation = {
      entity: 'ent',
      sortOrder: 'ASC' as any,
      data: inpurArgs,
      selections: [1, 2, 3],
      orderMetric: 'metric'
    };

    service.onEntityGridDetailsOpen.subscribe(received => {
      expect(received).toEqual(expectation);
    })
    service.onOpenEntityGridDetails('ent', 'ASC', inpurArgs, [1, 2, 3], 'metric');
  }));



  it('should test onEntityExpanded', async(() => {
    const service: SlicexListService = TestBed.get(SlicexListService);
    const expectation = {
      entity: 'ent',
      isExpanded: true
    };

    service.onEntityExpand.subscribe(received => {
      expect(received).toEqual(expectation);
    })
    service.onEntityExpanded('ent', true);
  }));



  it('should test onEntitySelectionChanged', async(() => {
    const service: SlicexListService = TestBed.get(SlicexListService);
    const expectation = {
      entity: 'ent',
      entityID: 123,
      entityValue: 'str',
      checked: false
    };

    service.onEntitySelectionChange.subscribe(received => {
      expect(received).toEqual(expectation);
    })
    service.onEntitySelectionChanged('ent', 123, 'str', false);
  }));


  it('should test setDateRange', async(() => {
    const service: SlicexListService = TestBed.get(SlicexListService);
    const now = new Date();
    const pDateRange = {
      startDate: now,
      endDate: now,
      startDateEpoch: 123,
      endDateEpoch: 234
    };

    const cDateRange = { ...pDateRange };
    const inputArgs = {
      isCompareEnabled: true,
      primaryDateRange: pDateRange,
      compareDateRange: cDateRange,
      chartFrequency: 'string'
    };

    service.onDateRangeSet.subscribe(received => {
      expect(received).toEqual({ dateRange: inputArgs });
    })
    service.setDateRange(inputArgs);
  }));

  it('should test updateEntityRequestMap', () => {
    const service: SlicexListService = TestBed.get(SlicexListService);
    service.guid();
    service.updateEntityRequestMap('str')
  });



  it('should test prepareData', () => {
    const service: SlicexListService = TestBed.get(SlicexListService);
    let apiResponse: ApiResponseObjectSlicexListResponse;

    // const rawListData: RawListData = {
    //   entity: 'string',
    //   displayName: 'string',
    //   orderMetric: 'string',
    //   data: [],
    //   listData: []
    // };

    // const inputData = new Map<string, RawListData>();
    // inputData.set("advertiser", rawListData)

    // service.setRawEntityListData(inputData);
    let result: any;

    // //when no error
    // apiResponse = {
    //   error: null,
    //   respId: '123',
    //   respObject: {
    //     data: [
    //       { id: 21, revenue: 1, bidsPlaced: 2, clickConversions: 3 },
    //       { id: 41, revenue: 4, bidsPlaced: 5, clickConversions: 6 }
    //     ],
    //     totalNoOfRecords: 2

    //   }
    // };
    // let metric = 'revenue';
    // let metricDetails = {
    //   display_name: 'Advertiser Spend',
    //   type: AppConstants.NUMBER_TYPE_CURRENCY,
    //   order: '1'
    // };
    // let currEntity = 'revenue';
    // result = service.prepareData(apiResponse, metric, metricDetails, currEntity);
    // expect(result).toBeTruthy();


    //when error
    apiResponse = {
      error: {
        message: 'msg',
        name: 'err-name'
      },
    }
    result = service.prepareData(apiResponse, 'advRevenue', '', '');
    expect(result).toEqual(null);
  });

  it('should test prepareListData', () => {
    const service: SlicexListService = TestBed.get(SlicexListService);

    localStorage.setItem(AppConstants.CACHED_CURRENCY, '$')

    const listData = [
      { id: 21, revenue: 1, bidsPlaced: 2, clickConversions: 3 },
    ];

    const metric = 'revenue';
    const metricDetails = {
      display_name: 'Advertiser Spend',
      type: AppConstants.NUMBER_TYPE_CURRENCY,
      order: '1'
    };


    const exp: ListData = {
      id: 21,
      name: undefined,
      value: '$ 1',
      valueRaw: '$ 1',
      changeFactor: 0,
      checked: false,
      valueCompare: '$ 0'
    };


    let result = service.prepareListData(listData, metric, metricDetails);
    expect(result).toEqual([exp]);
  });


  it('should test getter and setter of RawListData', () => {
    const service: SlicexListService = TestBed.get(SlicexListService);

    const rawListData: RawListData = {
      entity: 'string',
      displayName: 'string',
      orderMetric: 'string',
      data: [],
      listData: []
    };

    const inputData = new Map<string, RawListData>();
    inputData.set("123", rawListData)

    service.setRawEntityListData(inputData);
    let result = service.getRawEntityListData();
    expect(result.get('123')).toEqual(rawListData);

    service.setRawEntityListData(null);
    result = service.getRawEntityListData();
    expect(result).toEqual(null);
  });


  it('should test getEntityENUM', () => {
    const service: SlicexListService = TestBed.get(SlicexListService);
    let result = service.getEntityENUM('advertiser');
    expect(result).toEqual('advertiser');
  });


  it('should test getEntityENUM', () => {
    const service: SlicexListService = TestBed.get(SlicexListService);

    const inputObj = {
      advertiser: {}
    }

    const outputObj = {
      advertiser: {
        entity: 'advertiser',
        displayName: {},
        data: [],
        listData: []
      }
    }

    let result = service.initListData(inputObj);
    expect(result).toEqual(outputObj);
  });

  it('should test changeDisplayMetric', () => {
    const service: SlicexListService = TestBed.get(SlicexListService);


    let metricDetails = {
      display_name: "Advertiser Spend",
      order: "1",
      type: "CURRENCY"
    };
    // let result = service.changeDisplayMetric('revenue', metricDetails, 'DESC');
    // expect(result).toBeTruthy();
  });


  it('should test formatNumber', () => {
    const service: SlicexListService = TestBed.get(SlicexListService);

    localStorage.setItem(AppConstants.CACHED_CURRENCY, '$');

    expect(service.formatNumber(1, AppConstants.NUMBER_TYPE_CURRENCY, 'USD')).toEqual('$ 1');
    expect(service.formatNumber(1, AppConstants.NUMBER_TYPE_CURRENCY, '')).toEqual('$ 1');
    expect(service.formatNumber(1, AppConstants.NUMBER_TYPE_PERCENTAGE, '')).toEqual('1%');
    expect(service.formatNumber(1, undefined, '')).toEqual('1');
    expect(!service.formatNumber(null, undefined, '')).toEqual(true);
  });







});