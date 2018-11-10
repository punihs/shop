const raven = Raven.config('https://bbf0351970bc4723bb53c27b5c43ef7e@sentry.io/1313555', {});

if (localStorage.userinfo) {
  const user = JSON.parse(localStorage.userinfo);
  raven.setUser({
    id: user.id,
    email: user.email,
  });
}
raven.install();

angular.module('qui.components', []);

angular
  .module('qui.core', [
    'qui.components',
    'http-auth-interceptor',
  ])
  .constant('MODULE_VERSION', '0.0.1');
// this configs to initiated using provider
const CUSTOMER = 2;
angular
  .module('uiGenApp', [
    'uiGenApp.constants',
    'qui.core',
    'ngAnimate',
    'ui.router',
    'ui.bootstrap',
    'ngFileUpload',
    'angular-loading-bar',
    'naif.base64',
    'toaster',
    'ngclipboard',
    'ngIntlTelInput',
    'ngRaven',
  ])
  .config(($urlRouterProvider, $locationProvider, ngIntlTelInputProvider, $ravenProvider) => {
    const dev = location.href.includes('.test');
    $ravenProvider.development(true);
    ngIntlTelInputProvider.set({
      initialCountry: 'us',
      autoHideDialCode: true,
      nationalMode: false,
      utilsScript: '/bower_components/intl-tel-input/build/js/utils.js',
    });

    $urlRouterProvider.when('/', '/dashboard');
    $urlRouterProvider.otherwise(($injector) => $injector.get('$state').go('access.404'));

    $locationProvider.html5Mode(true);
  })
  .factory('CONFIG', (appConfig) => appConfig[CUSTOMER])
  .factory('$exceptionHandler', function () {
    return function errorCatcherHandler(exception, cause) {
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
  }]);

