angular.module('uiGenApp')
  .factory('URLS', () => {
    const { host, protocol } = window.location;
    const PREFIX = `${protocol}//${host.substr(0, ((host.includes('staging')) ? host.indexOf('-') : -1) + 1)}`;
    const DOMAIN = `${host.substr(host.indexOf('.') + 1)}`;

    const project = 'parcel';

    return {
      CDN: `${PREFIX}cdn.${DOMAIN}`,
      ACCOUNTS: `${PREFIX}accounts.${DOMAIN}`,
      HELP: `${PREFIX}ship.${DOMAIN}`,

      API: `${PREFIX}api.${DOMAIN}`,
      PARCEL_API: `${PREFIX}${project}-api.${DOMAIN}`,
      CHICKEN_API: `${PREFIX}chicken-api.${DOMAIN}`,

      OAUTH: `${PREFIX}accounts.${DOMAIN}/authorise?client_id=ops&response_type=code&` +
      `redirect_uri=${PREFIX}parcel-ops.${DOMAIN}/access/oauth`,
    };
  });
