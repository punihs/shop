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
      PARCEL: `${PREFIX}parcel.${DOMAIN}`,
      HELP: `${PREFIX}ship.shoppre.com`,

      API: `${PREFIX}api.${DOMAIN}`,
      PARCEL_API: `${PREFIX}${project}-api.${DOMAIN}`,
      PAY_API: `${PREFIX}pay-api.${DOMAIN}`,
      CHICKEN_API: `${PREFIX}chicken-api.${DOMAIN}`,

      OAUTH: `${PREFIX}accounts.${DOMAIN}/authorise?client_id=${project}&response_type=code&` +
      `redirect_uri=${PREFIX}${project}.${DOMAIN}/access/oauth`,
    };
  });
