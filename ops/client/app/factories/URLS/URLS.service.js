angular.module('uiGenApp')
  .factory('URLS', () => {
    const { host, protocol } = window.location;
    const PREFIX = `${protocol}//${host.substr(0, host.indexOf('-') + 1)}`;
    const DOMAIN = `${host.substr(host.indexOf('.') + 1)}`;

    return {
      CDN: `${PREFIX}cdn.${DOMAIN}`,
      AUTH: `${PREFIX}api.${DOMAIN}`,
      PARCEL_API: `${PREFIX}parcel-api.${DOMAIN}`,
      ACCOUNTS: `${PREFIX}accounts.${DOMAIN}`,
      HELP: `${PREFIX}ship.${DOMAIN}`,
      OAUTH: `${PREFIX}accounts.${DOMAIN}/authorise?client_id=ops&response_type=code&` +
      `redirect_uri=${PREFIX}ops.${DOMAIN}/access/oauth`,
    };
  });
