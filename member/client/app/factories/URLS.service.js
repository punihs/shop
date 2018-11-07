angular.module('uiGenApp')
  .factory('URLS', () => {
    const { host, protocol } = window.location;
    const PREFIX = `${protocol}//${host.substr(0, host.indexOf('-') + 1)}`;
    const DOMAIN = `${host.substr(host.indexOf('.') + 1)}`;

    return {
      DOMAIN,
      PREFIX,
      CDN: `${PREFIX}cdn.${DOMAIN}`,
      AUTH: `${PREFIX}api.${DOMAIN}`,
      PFAPI: `${PREFIX}pf-api.${DOMAIN}`,
      PAYAPI: `${PREFIX}pay-api.${DOMAIN}`,
      ACCOUNTS: `${PREFIX}accounts.${DOMAIN}`,
      HELP: `${PREFIX}ship.${DOMAIN}`,
      OAUTH: `${PREFIX}accounts.${DOMAIN}/authorise?client_id=member&response_type=code&` +
      `redirect_uri=${PREFIX}member.${DOMAIN}/access/oauth`,
    };
  });
