/* @ngInject */
function UrlInterceptor(Session, urls, OAuthToken) {
  return {
    request(config) {
      const conf = config;

      // handle url request without domain to api server
      console.log(conf.url[0] === '/');
      if(conf.url[0] === '/') {
        conf.url = `${urls.API_SERVER}/api${conf.url}`;
        // Attach accessToken to api requests
        conf.headers.Authorization = `Bearer ${OAuthToken.getAccessToken()}`;
      }
      if(!!conf.ignoreAuthModule) return conf; // don't need token


      return conf;
    },
  };
}

export default UrlInterceptor;
