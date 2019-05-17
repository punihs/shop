angular
  .module('uiGenApp')
  .factory('AuthInterceptor', (Session, URLS) => ({
    request: (conf) => {
      const config = conf;
      if (config.url[0] === '/') config.url = `${URLS.PARCEL}/api${config.url}`;

      // const parcel = '*';
      const engage = '#';
      const pay = '$';
      const login = '~';
      const courier = '&';

      const map = {
        // [parcel]: URLS.PARCEL,
        [engage]: URLS.ENGAGE,
        [pay]: URLS.PAY,
        [login]: URLS.LOGIN,
        [courier]: URLS.COURIER,
      };

      const type = config.url[0];
      const reverseMap = Object.keys(map).reduce((nxt, x) => Object.assign(nxt, { [x]: true }), {});
      if (type === '~' && config.url[0] === '~') {
        config.url = `${URLS.LOGIN}${config.url.substr(2)}`;
      } else if (reverseMap[type]) {
        config.url = `${map[type]}/api${config.url.substr(1)}`;
      }

      if (!!conf.ignoreAuthModule) return conf;

      if (Session.isAuthenticated()) {
        config.headers.Authorization = `Bearer ${Session.getAccessToken()}`;
      }

      return config;
    },
  }))
  .config($httpProvider => $httpProvider.interceptors.push('AuthInterceptor'));
