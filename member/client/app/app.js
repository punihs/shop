angular.module('qui.components', []);

angular
  .module('qui.core', [
    'qui.components',
    'http-auth-interceptor',
  ])
  .constant('MODULE_VERSION', '0.0.1');
// this configs to initiated using provider
const MEMBER = 2;
angular.module('uiGenApp', [
  'uiGenApp.constants',
  'qui.core',
  'ngAnimate',
  'ui.router',
  'ui.bootstrap',
  'mwl.calendar',
  'chart.js',
  'ngFileUpload',
  'angular-loading-bar',
  'easypiechart',
  'scrollable-table',
  'naif.base64',
  'rzModule',
  'toaster',
  'ngclipboard',
  'isteven-multi-select',
  'dndLists',
  'ngSanitize',
  'ngCookies',
  'btford.socket-io',
  'ngIntlTelInput',
])

  .config(($urlRouterProvider, $locationProvider, ngIntlTelInputProvider) => {
    ngIntlTelInputProvider.set({ initialCountry: 'us' });

    $urlRouterProvider.when('/', '/locker');
    $urlRouterProvider.otherwise(($injector) => $injector.get('$state').go('access.404'));

    $locationProvider.html5Mode(true);
  })
  .constant('RENAMED_STATES', {
  })
  .factory('CONFIG', (appConfig) => appConfig[MEMBER]);

