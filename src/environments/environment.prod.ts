// import { NgxLoggerLevel } from 'ngx-logger';

export const environment = {
  production: true,
  AUTH_BASE_PATH: 'https://urgv2.atomex.net',
  API_BASE_PATH: 'https://apiv2.atomex.net',
  // logging: {
  //   serverLoggingUrl: 'https://apiv2.atomex.net/v2/logging',
  //   level: NgxLoggerLevel.OFF,
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
