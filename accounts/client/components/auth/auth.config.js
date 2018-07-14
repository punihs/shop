/* @ngInject */
function authConfig($httpProvider, $provide, urls, OAuthTokenProvider, OAuthProvider) {
  // angular-oauth2
  $httpProvider.interceptors.push('oauthInterceptor');
  $httpProvider.interceptors.push('UrlInterceptor');

  // angular-oauth2

  $provide.decorator('OAuthToken', ($delegate, $injector) => {
    const Token = {
      setToken(token) {
        console.log(urls.OAUTH, ': ', token);
        return $injector.get('Session').create(urls.OAUTH, token);
      },
      getToken() {
        return $injector.get('Session').read(urls.OAUTH) || false;
      },
      getAccessToken() {
        const token = $injector.get('Session').read(urls.OAUTH || 'userinfo');
        if(token && token.access_token) return token.access_token;
        return false;
      },
      removeToken() {
        return $injector.get('Session').remove(urls.OAUTH);
      },
    };
    Object.defineProperties($delegate, {
      token: {
        set: Token.setToken,
        get: Token.getToken,
        enumerable: true,
        configurable: true,
      },
    });

    Object.assign($delegate, Token);

    return $delegate;
  });

  OAuthTokenProvider.configure({
    name: 'token',
    options: {
      secure: urls.SSL || false,
      path: '/',
    },
  });

  OAuthProvider.configure({
    baseUrl: urls.API_SERVER,
    clientId: 'accounts',
    clientSecret: '83723bc3eaaec892badb3ce8367ffb6a',
    grantPath: '/oauth/token',
    revokePath: '/oauth/revoke',
  });
}

export default authConfig;
