// const raven = Raven.config('https://a4576e2b58fa419d9a76610db580a7b0@sentry.shoppre.com/5', {});
//
// if (localStorage.adminUserinfo) {
//   const user = JSON.parse(localStorage.adminUserinfo);
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
  .constant('MODULE_VERSION', '0.0.1');
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
  .config(($urlRouterProvider, $locationProvider, ngIntlTelInputProvider,
           // $ravenProvider
  ) => {
    // const dev = location.href.includes('.test');
    // $ravenProvider.development(true);
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
  .constant('ADDRESS', {
    name: 'Indian shoppre LLP,',
    line1: '#181, 1st Floor, 2nd Cross Rd,',
    line2: '7th Main, 1st Block Koramangala,',
    line3: 'Bengaluru, Karnataka,560034',
    phone: '+91 9148351414',
  })
  .constant('ONESIGNAL', {
    development: '91cbfcb8-6ad5-4128-a0f6-a653eeeaac4c',
    staging: '98049cea-88e2-49b5-b2a3-d6c5fe0d6dbf',
    production: 'd0bf3fb3-1bd7-4ad8-9ba0-85ca0eb1273f',
  })
  // .factory('$exceptionHandler', () => (exception) => Raven.captureException(exception))
  // .factory('errorHttpInterceptor', ($q) => ({
  //   responseError: function responseError(rejection) {
  //     Raven.captureException(new Error('HTTP response error'), {
  //       extra: {
  //         config: rejection.config,
  //         status: rejection.status,
  //       },
  //     });
  //
  //     return $q.reject(rejection);
  //   },
  // }))
  // .config($httpProvider => $httpProvider.interceptors.push('errorHttpInterceptor'));

