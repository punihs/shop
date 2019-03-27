angular
  .module('uiGenApp')
  .factory('AuthInterceptor', (Session, URLS) => ({
    request: (conf) => {
      const config = conf;
      if (!!conf.ignoreAuthModule) return conf;

      if (Session.isAuthenticated()) {
        config.headers.Authorization = `Bearer ${Session.getAccessToken()}`;
      }

      if (config.url[0] === '#') config.url = `${URLS.ENGAGE_API}/api${config.url.substr(1)}`;
      if (config.url[0] === '$') config.url = `${URLS.PAY_API}${config.url.substr(1)}`;
      if (config.url[0] === '~') config.url = `${URLS.API}${config.url.substr(1)}`;
      if (config.url[0] === '%') config.url = `${URLS.URLS_SHIP}${config.url.substr(1)}`;
      if (config.url[0] === '/') config.url = `${URLS.PARCEL_API}/api${config.url}`;
      return config;
    },
  }))
  .config($httpProvider => $httpProvider.interceptors.push('AuthInterceptor'));
