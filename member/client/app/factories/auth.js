angular.module('uiGenApp')
// Depending on constant: AUTH_EVENTS
  .factory('Auth',
    ($log, $http, $q, Session) => {
      const authService = {};
      let refreshingToken = false;

      authService.login = function login(credentials) {
        return $http
          .post('~~/oauth/token', credentials, {
            ignoreAuthModule: true,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            transformRequest(obj) {
              return Object
                .keys(obj)
                .map(p => `${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`)
                .join('&');
            },
          })
          .then(response => Session.create('oauth', response.data))
          .catch(
            res => {
              Session.destroy();
              return $q.reject(res.data);
            });
      };

      authService.refreshToken = () => {
        // To Save Multiple Async RefreshToken Request
        if (refreshingToken) {
          $log.warn('Refresh token request already sent.');
          return $q.reject({ warning: 'Refresh token request already sent.' });
        }
        refreshingToken = true; // Set refresh_token reuqest tracker flag
        return $http
          .post(
            '~~/oauth/token',
            { refresh_token: Session.read('oauth').refresh_token },
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            transformRequest(obj) {
              return Object
                  .keys(obj)
                  .map(p => `${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`)
                  .join('&');
            },
            ignoreAuthModule: true,
          }
          )
          .then(res => {
            Session.create('oauth', res.data);
            refreshingToken = false; // reset refresh_token reuqest tracker flag
            return $q.resolve(res);
          })
          .catch(res => {
            refreshingToken = false; // reset refresh_token reuqest tracker flag
            return $q.reject(res);
          });
      };

      authService.logout = function logout() {
        return $http
          .post('~~/oauth/revoke', { access_token: Session.getAccessToken() }, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            transformRequest(obj) {
              return Object
                .keys(obj)
                .map(p => `${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`)
                .join('&');
            },
          })
          .then(
            response => {
              // Destroy Session data
              Session.destroy();
              return response.data;
            },
            err => {
              Session.destroy();
              return $q.reject(err.data);
            }
          );
      };

      authService.setSessionData = () => $q.all([
        $http
          .get('/users/me')
          .then(response => Session.create('userinfo', response.data)),
        $http
          .get('/users/states?type=PACKAGE')
          .then(response => Session.create('states', response.data)),
      ]);

      return authService;
    });
