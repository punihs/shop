angular.module('qui.core')
  // Depending on constant: AUTH_EVENTS
  .factory('Auth',
    function Auth($log, $http, $q, Session, URLS) {
      const authService = {};
      let refreshingToken = false;

      authService.login = function login(credentials) {
        const url = `${URLS.PARTNER_OAUTH_API}/login`;
        return $http
          .post(url, credentials, { ignoreAuthModule: true })
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
        const url = `${URLS.PARTNER_OAUTH_API}/refresh`;
        return $http
          .post(
            url,
            { refresh_token: Session.read('oauth').refresh_token },
            { ignoreAuthModule: true }
          )
          .then(res => {
            Session.create('oauth', res.data);
            refreshingToken = false; // reset refresh_token reuqest tracker flag
            return $q.resolve(res);
          }).catch(res => {
            refreshingToken = false; // reset refresh_token reuqest tracker flag
            return $q.reject(res);
          });
      };

      authService.logout = function logout() {
        const url = `${URLS.PARTNER_OAUTH_API}/logout`;
        return $http
          .post(url, { access_token: Session.getAccessToken() })
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

      authService.setSessionData = () => {
        return $q.all([
          $http
            .get(`${URLS.API}/users/me`)
            .then(response => Session.create('userinfo', response.data)),
          $http
            .get(`${URLS.API}/users/states`)
            .then(response => Session.create('states', response.data)),
        ]);
      }

      return authService;
    });
