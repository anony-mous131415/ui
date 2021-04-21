// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

declare const require: any;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Then we find all the tests. 
//Testing all spec files
// const context = require.context('./', true, /\.spec\.ts$/);

//Testing only services -- Production It should be 60-80%. If it is below 60%. Do not build it.
// const context = require.context('./', true, /.service\.spec\.ts$/);
// const context = require.context('./', true, /list.service\.spec\.ts$/);

//Testing only specific files : point to the spec file u want to test HERE .
// const context = require.context('./', true, /slicex-chart-container.component\.spec\.ts$/);
// const context = require.context('./', true, /entities.service\.spec\.ts$/);
// const context = require.context('./', true, /creative-edit.component\.spec\.ts$/);
// const context = require.context('./', true, /tbm2.component\.spec\.ts$/);

// const context = require.context('./', true, /strategy-bulk-edit.service\.spec\.ts$/);
// const context = require.context('./', true, /bulk-edit-review-request-response.component\.spec\.ts$/);
const context = require.context('./', true, /bulk-edit-activity-log.component\.spec\.ts$/);






// And load the modules.
context.keys().map(context);
