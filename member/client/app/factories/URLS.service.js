angular.module('uiGenApp')
  .factory('URLS', () => {
    const { host, protocol } = window.location;
    const PREFIX = `${protocol}//${host.substr(0, host.indexOf('-') + 1)}`;
    const DOMAIN = `${host.substr(host.indexOf('.') + 1)}`;
    const PROJECT = 'parcel';

    const buildUrl = (subdomain) => `${PREFIX}${subdomain}.${DOMAIN}`;
    const UI_URL = buildUrl(PROJECT);
    const LOGIN = buildUrl('login');
    return {
      PREFIX,
      LOGIN,
      OAUTH_CLIENT_ID: PROJECT,
      UI_URL,
      COURIER: buildUrl('courier'),
      PAY: buildUrl('pay'),
      ENGAGE: buildUrl('engage'),

      CDN: `${PREFIX}cdn.${DOMAIN}`,

      OAUTH: `${LOGIN}/authorise?client_id=${PROJECT}&response_type=code&` +
        `redirect_uri=${UI_URL}/access/oauth`,
      HELP: 'https://ship.shoppre.com',
    };
  });
