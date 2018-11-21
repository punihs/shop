const raven = Raven.config('https://63923aa0ddd84099a85067b781b6b403@sentry.shoppre.com/4', {});

if (localStorage.userinfo) {
  const user = JSON.parse(localStorage.userinfo);
  raven.setUser({
    id: user.id,
    email: user.email,
  });
}
raven.install();

// this configs to initiated using provider
const CUSTOMER = 2;
angular
  .module('uiGenApp', [
    'uiGenApp.constants',
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
    'http-auth-interceptor',
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

    $urlRouterProvider.when('/', '/dashboard');
    $urlRouterProvider.otherwise(($injector) => $injector.get('$state').go('access.404'));

    $locationProvider.html5Mode(true);
  })
  .factory('CONFIG', (appConfig) => appConfig[CUSTOMER])
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
  })
  // - todo: Raven to moved to factor
  // do not rethrow the exception - breaks the digest cycle, (exception, cause)
  .factory('$exceptionHandler', () => (exception) => Raven.captureException(exception))
  .factory('errorHttpInterceptor', ($q) => ({
    responseError: function responseError(rejection) {
      Raven.captureException(new Error('HTTP response error'), {
        extra: {
          config: rejection.config,
          status: rejection.status,
        },
      });

      return $q.reject(rejection);
    },
  }))
  .config(['$httpProvider', ($httpProvider) => {
    $httpProvider.interceptors.push('errorHttpInterceptor');
  }]);

