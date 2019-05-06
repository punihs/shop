angular.module('uiGenApp')
  .factory('URLS', () => {
    const { host, protocol } = window.location;
    const PREFIX = `${protocol}//${host
      .includes('staging') ? host.substr(0, host.indexOf('-') + 1) : ''}`;

    const DOMAIN = `${host.substr(host.indexOf('.') + 1)}`;
    const PROJECT = 'parcel';
    const COMPONENT = 'admin';

    const OAUTH_CLIENT_ID = `${PROJECT}-${COMPONENT}`;

    const buildUrl = (subdomain) => `${PREFIX}${subdomain}.${DOMAIN}`;
    const UI_URL = buildUrl(PROJECT);
    const LOGIN = buildUrl('login');
    return {
      PREFIX,
      PROJECT,
      OAUTH_CLIENT_ID,
      UI_URL,
      DOMAIN,
      LOGIN,
      PARCEL: buildUrl(PROJECT),
      PAY: buildUrl('pay'),
      ENGAGE: 'http://localhost:7010' || buildUrl('engage'),

      CDN: `${PREFIX}cdn.${DOMAIN}`,

      OAUTH: `${LOGIN}/authorise?client_id=${OAUTH_CLIENT_ID}&response_type=code&` +
      `redirect_uri=${UI_URL}/${COMPONENT}/access/oauth`,
      HELP: 'https://ship.shoppre.com',
    };
  });
