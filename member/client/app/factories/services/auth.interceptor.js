angular
  .module('qui.core')
  .factory('AuthInterceptor', (Session, URLS) => ({
    request: (conf) => {
      const config = conf;
      if (!!conf.ignoreAuthModule) return conf;

      if (Session.isAuthenticated()) {
        config.headers.Authorization = `Bearer ${Session.getAccessToken()}`;
      }

      if (Session.read('ROLE_ADMIN') && !config.skipAdminView) {
        config.headers.admin = true;
        config.headers.userIds = Session.read('VIEW_AS_IDS');
      }

      if (config.url[0] === '~') config.url = `${URLS.AUTH}${config.url}`;
      if (config.url[0] === '/') config.url = `${URLS.PFAPI}/api${config.url}`;
      return config;
    },
  }))
  .config($httpProvider => $httpProvider.interceptors.push('AuthInterceptor'));
