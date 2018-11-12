// const raven = Raven.config('https://71883f8963384e47a84bada0451462f1@sentry.io/1313557', {});
//
// if (localStorage.userinfo) {
//   const user = JSON.parse(localStorage.userinfo);
//   debugger
//   raven.setUser({
//     id: user.id,
//     email: user.email,
//   });
// }
//
// raven.install();

angular.module('qui.components', []);

angular
  .module('qui.core', [
    'qui.components',
    'http-auth-interceptor',
  ])
  .constant('MODULE_VERSION', '0.0.1')
// this configs to initiated using provider
angular.module('uiGenApp', [
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
  'ngRaven',
])
  .config(($urlRouterProvider, $locationProvider, ngIntlTelInputProvider, $ravenProvider) => {
    const dev = location.href.includes('.test');
    $ravenProvider.development(dev);
    ngIntlTelInputProvider.set({
      initialCountry: 'us',
      autoHideDialCode: true,
      nationalMode: false,
      utilsScript: '/bower_components/intl-tel-input/build/js/utils.js',
    });
    $urlRouterProvider.when('/', '/packages');
    $urlRouterProvider.otherwise(($injector) => $injector.get('$state').go('access.404'));

    $locationProvider.html5Mode(true);
  })
  .factory('$exceptionHandler', function () {
    return function errorCatcherHandler(exception, cause) {
      console.error(exception.stack);
      Raven.captureException(exception);
      // do not rethrow the exception - breaks the digest cycle
    };
  })
  .factory('errorHttpInterceptor', ['$q', function ($q) {
    return {
      responseError: function responseError(rejection) {
        Raven.captureException(new Error('HTTP response error'), {
          extra: {
            config: rejection.config,
            status: rejection.status,
          },
        });
        return $q.reject(rejection);
      },
    };
  }])
  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('errorHttpInterceptor');
  }])

  .constant('RENAMED_STATES', {
  });

