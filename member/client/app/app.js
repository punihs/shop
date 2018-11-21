const raven = Raven.config('https://63923aa0ddd84099a85067b781b6b403@sentry.shoppre.com/4', {});

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
  .constant('MODULE_VERSION', '0.0.1')
  .constant('ADDRESS', {
    line1: '#181, 1st Floor,',
    line2: '2nd Cross Rd, 1st Block Koramangala,',
    line3: 'Bengaluru, Karnataka,',
    line4: 'India, 560034',
    phone: '+91 80 4094 4077',
    email: 'support@shoppre.com',
  })
  .constant('ACCOUNT_DETAILS', {
    account_name: 'INDIANSHOPPRE LLP',
    account_number: '918020022874771',
    branch: 'Bangalore',
    ifs_code: 'UTIB0000009',
    micr_code: '560211002',
    email_id: 'finance@shoppre.com',
    address: 'NO. 9, M.G. ROAD, BLOCK-A',
    swift_code: 'AXISINBB009',
  });

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
      console.log(exception, cause);
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
        console.log(rejection);
        return $q.reject(rejection);
      },
    };
  }])
  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('errorHttpInterceptor');
  }]);

