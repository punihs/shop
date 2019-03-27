angular.module('uiGenApp')
  .factory('URLS', () => {
    const { host, protocol } = window.location;
    const PREFIX = `${protocol}//${host.substr(0, host.indexOf('-') + 1)}`;
    const DOMAIN = `${host.substr(host.indexOf('.') + 1)}`;
    const project = 'parcel';
    return {
      DOMAIN,
      PREFIX,

      CDN: `${PREFIX}cdn.${DOMAIN}`,
      ACCOUNTS: `${PREFIX}accounts.${DOMAIN}`,
      WWW: `${PREFIX}www.${DOMAIN}`,
      PARCEL: `${PREFIX}parcel.shoppre.test`,
      HELP: 'https://ship.shoppre.com',
      URLS_SHIP: `${PREFIX}ship-api.${DOMAIN}`,
      API: `${PREFIX}api.${DOMAIN}`,
      PARCEL_API: `${PREFIX}${project}-api.shoppre.test`,
      // PARCEL_API: 'http://parcel-api.shoppre.test',
      PAY_API: `${PREFIX}pay-api.${DOMAIN}`,
      ENGAGE_API: `${PREFIX}engage-api.${DOMAIN}`,

      OAUTH: `${PREFIX}accounts.${DOMAIN}/authorise?client_id=${project}&response_type=code&` +
      `redirect_uri=${PREFIX}${project}.${DOMAIN}/access/oauth`,
    };
  });
