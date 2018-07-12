
angular.module('qui.components', []);

angular
  .module('qui.core', [
    'qui.components',
    'http-auth-interceptor',
  ])
  .constant('MODULE_VERSION', '0.0.1');
  // this configs to initiated using provider

angular.module('uiGenApp', [
  'qui.core',
  'ngAnimate',
  'ui.router',
  'ui.bootstrap',
  'mwl.calendar',
  'chart.js',
  'restangular',
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
  'ngCookies'
])

  .config(($urlRouterProvider, $locationProvider, RestangularProvider) => {
    let API;
    switch (window.location.host) {
      case 'partner.quezx.com':
        API = 'https://qapi.quezx.com/api';
        break;
      case 'staging-partner.quezx.com':
        API = 'https://staging-qapi.quezx.com/api';
        break;
      case 'gabbar-partner.quezx.com':
        API = 'https://staging-qapi.quezx.com/api';
        break;
      default:
        API = 'http://api.quezx.test/api';
    }
    RestangularProvider.setBaseUrl(API);
    $urlRouterProvider.when('/', '/dashboard');
    $urlRouterProvider.otherwise(($injector) => $injector.get('$state').go('access.404'));

    $locationProvider.html5Mode(true);

  }).run(($sce) => {

  String.prototype.titleCase = function() {
    var firstLetterRx = /(^|\s)[a-z]/g;
    return this.replace(firstLetterRx, (str)=>{return str.toUpperCase();});
  };

  String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
  };

});
