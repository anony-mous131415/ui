import { TestBed } from '@angular/core/testing';
import { BreadcrumbsService } from '../breadcrumbs.service';


describe('BreadcrumbsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BreadcrumbsService = TestBed.get(BreadcrumbsService);
    expect(service).toBeTruthy();
  });




  it('should test createBCObject', () => {
    const service: BreadcrumbsService = TestBed.get(BreadcrumbsService);

    //test-1 : advertiser
    let apiResp1 = {
      id: 1,
      name: 'adv1',
      parent: {
        id: 2,
        name: 'licensee1'
      }
    };

    let expectation1 = {
      advertiser: {
        id: 1,
        name: 'adv1'
      }
    }

    let result = service.createBCObject(apiResp1);
    expect(result).toEqual(expectation1);


    //test-2 : campaign
    let apiResp2 = {
      id: 1,
      name: 'cmp1',
      parent: {
        id: 2,
        name: 'adv1',
        parent: {
          id: 3,
          name: 'lic1',
        }
      }
    };

    let expectation2 = {
      advertiser: {
        id: 2,
        name: 'adv1'
      },
      campaign: {
        id: 1,
        name: 'cmp1'
      }
    }

    result = service.createBCObject(apiResp2);
    expect(result).toEqual(expectation2);

    //test-3 : strategy
    let apiResp3 = {
      id: 1,
      name: 'str1',
      parent: {
        id: 2,
        name: 'cmp1',
        parent: {
          id: 3,
          name: 'adv1',
          parent: {
            id: 4,
            name: 'lic1'
          }
        }
      }
    };

    let expectation3 = {
      advertiser: {
        id: 3,
        name: 'adv1'
      },
      campaign: {
        id: 2,
        name: 'cmp1'
      },
      strategy: {
        id: 1,
        name: 'str1'
      }
    }

    result = service.createBCObject(apiResp3);
    expect(result).toEqual(expectation3);


    //nothing in resp
    result = service.createBCObject({});
    expect(result).toEqual({});

  });




});
