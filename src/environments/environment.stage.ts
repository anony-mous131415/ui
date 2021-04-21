// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
// import { NgxLoggerLevel } from 'ngx-logger';

export const environment = {
  production: false,
  // AUTH_BASE_PATH: 'https://urgv2beta.atomex.net',
  AUTH_BASE_PATH: 'https://authv2stage3.atomex.net',
  API_BASE_PATH: 'https://apiv2stage3.atomex.net',
  // logging: {
  //   serverLoggingUrl: 'https://apiv2stage.atomex.net:10045/v2/logging',
  //   level: NgxLoggerLevel.DEBUG,
  //   serverLogLevel: NgxLoggerLevel.ERROR,
  //   disableConsoleLogging: false,
  //   enableSourceMaps: true
  // },
  theme: {
    LOGO_LG_URL: 'https://cdn.atomex.net/atomex-ui/static/logos/default.png',
    LOGO_SM_URL: 'https://cdn.atomex.net/atomex-ui/static/logos/default.png',
    FAV_ICON: 'https://cdn.atomex.net/atomex-ui/static/favicon/default.ico'
  },
  authentication: {
    GOOGLE_CLIENT_ID: '35930406110-b6udnfb3b3lra01epd35f107qnqeqknj.apps.googleusercontent.com',
  },
  hosts: {
    origin: 'http://origin.atomex.net'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
