angular.module('qui.core')
  // Depending on constant: AUTH_EVENTS
  .factory('Auth',
    ($log, $http, $q, Session, URLS) => {
      const authService = {};
      let refreshingToken = false;

      authService.login = function login(credentials) {
        const url = '~~/oauth/token';
        return $http
          .post(url, credentials, {
            ignoreAuthModule: true,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            transformRequest(obj) {
              return Object
                .keys(obj)
                .map(p => `${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`)
                .join('&');
            },
          })
          .then(response => Session.create('adminOauth', response.data))
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
        const url = '~~/oauth/token';
        return $http
          .post(
            url,
            { refresh_token: Session.read('adminOauth').refresh_token },
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
            Session.create('adminOauth', res.data);
            refreshingToken = false; // reset refresh_token reuqest tracker flag
            return $q.resolve(res);
          }).catch(res => {
            refreshingToken = false; // reset refresh_token reuqest tracker flag
            return $q.reject(res);
          });
      };

      authService.logout = function logout() {
        const url = '~~/oauth/revoke';
        return $http
          .post(url, { access_token: Session.getAccessToken() }, {
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
          .then(response => Session.create('adminUserinfo', response.data)),
        $http
          .get('/users/states?type=PACKAGE')
          .then(response => Session.create('adminStates', response.data)),
        $http
          .get('/users/states?type=SHIPMENT')
          .then(response => Session.create('adminShipment-states', response.data)),
        $http
          .get('/afterShipCarriers')
          .then(response => Session.create('afterShipCarriers', response.data)),
      ]);

      return authService;
    });
