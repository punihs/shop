angular
  .module('uiGenApp')
  .factory('LoginAs', ($http, toaster, $window) => ({
    init: (username) => $http
      .post('~/api/authorise', { grant_type: 'loginAs', username, app_id: 3 })
      .then(({ data: url }) => {
        $window.open(url);
      })
      .catch(() => toaster.pop('error', 'Unexpercted error')),
  }));
