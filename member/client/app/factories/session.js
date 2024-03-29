angular.module('uiGenApp')
  .factory('Session', [
    '$window',
    function Session($window) {
      const sessionService = {};

      sessionService.create = function create(key, value) {
        localStorage[key] = angular.toJson(value);
      };

      sessionService.read = function read(key) {
        return angular.fromJson($window.localStorage[key]);
      };

      sessionService.clear = items => (items.map(x => (delete $window.localStorage[x])));

      sessionService.destroy = function destroy() {
        $window.localStorage.clear();
      };

      sessionService.isAuthenticated = function isAuthenticated() {
        return !!(sessionService.read('oauth') && sessionService.read('oauth').access_token);
      };

      sessionService.getAccessToken = function getAccessToken() {
        return sessionService.read('oauth') && sessionService.read('oauth').access_token;
      };

      sessionService.isAuthorized = function isAuthorized(authorizedRoles) {
        let roles = authorizedRoles;
        if (!angular.isArray(roles)) {
          roles = [].push(roles);
        }

        return (sessionService.isAuthenticated() && ~roles.indexOf(sessionService.userRole));
      };

      return sessionService;
    },
  ]);
