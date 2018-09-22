angular
  .module('uiGenApp')
  .factory('LoginAs', ($http, toaster, $window) => ({
    init: (username) => $http
      .post('/authorise', { grant_type: 'loginAs', username })
      .then(({ data: url }) => {
        $window.open(url);
      })
      .catch(() => toaster.pop('error', 'Unexpercted error')),
  }));
