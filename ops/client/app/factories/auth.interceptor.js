angular
  .module('qui.core')
  .factory('AuthInterceptor', (Session, URLS) => ({
    request: (conf) => {
      const config = conf;
      if (!!conf.ignoreAuthModule) return conf;

      if (Session.isAuthenticated()) {
        config.headers.Authorization = `Bearer ${Session.getAccessToken()}`;
      }

      if (config.url[0] === '#') config.url = `${URLS.CHICKEN_API}${config.url.substr(1)}`;
      if (config.url[0] === '~') config.url = `${URLS.API}/api${config.url.substr(1)}`;
      if (config.url[0] === '/') config.url = `${URLS.PARCEL_API}/api${config.url}`;
      return config;
    },
  }))
  .config($httpProvider => $httpProvider.interceptors.push('AuthInterceptor'));
