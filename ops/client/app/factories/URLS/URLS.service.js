angular.module('uiGenApp')
  .factory('URLS', () => {
    const { host, protocol } = window.location;
    const PREFIX = `${protocol}//${host
      .includes('staging') ? host.substr(0, host.indexOf('-') + 1) : ''}`;

    const DOMAIN = `${host.substr(host.indexOf('.') + 1)}`;
    const PROJECT = 'parcel';
    const COMPONENT = 'ops';

    const OAUTH_CLIENT_ID = `${PROJECT}-${COMPONENT}`;
    const SUBDOMAIN = OAUTH_CLIENT_ID;

    const buildUrl = (subdomain) => `${PREFIX}${subdomain}.${DOMAIN}`;
    const UI_URL = buildUrl(SUBDOMAIN);
    const LOGIN = buildUrl('login');
    return {
      PREFIX,
      PROJECT,
      OAUTH_CLIENT_ID,
      SUBDOMAIN,
      UI_URL,
      DOMAIN,
      LOGIN,
      PARCEL: buildUrl(PROJECT),
      PAY: buildUrl('pay'),
      ENGAGE: buildUrl('engage'),

      CDN: `${PREFIX}cdn.${DOMAIN}`,

      OAUTH: `${LOGIN}/authorise?client_id=${OAUTH_CLIENT_ID}&response_type=code&` +
      `redirect_uri=${UI_URL}/access/oauth`,
      HELP: 'https://ship.shoppre.com',
    };
  });
