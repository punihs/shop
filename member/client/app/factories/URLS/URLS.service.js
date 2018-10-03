
angular.module('uiGenApp')
  .factory('URLS', () => {
    let vars;
    const { host, protocol } = window.location;
    const PREFIX = `${protocol}//${host.substr(0, host.indexOf('-') + 1)}`;
    let DOMAIN = `${host.substr(host.indexOf('.') + 1)}`;

    switch (window.location.host) {
      case 'member.shoppre.com':
        vars = {
          DOMAIN,
          PREFIX,
          CDN: 'https://cdn.shoppre.com',
          ADMIN: 'https://admin.shoppre.com',
          QNOTIFY_SERVER: 'https://qnotify.shoppre.com/api',
          API: 'https://api.shoppre.com/api',
          API_BASE: 'https://api.shoppre.com',
          ACCOUNTS: '//accounts.shoppre.com',
          HELP: 'https://www.shoppre.com/contact',
          OAUTH: '//accounts.shoppre.com/authorise?client_id=member&response_type=code&' +
          'redirect_uri=https://member.shoppre.com/access/oauth',
          PDF_JS: 'https://pdfviewer.shoppre.com/web/viewer.html',
          BADGE: 'https://www.shoppre.com/embed/badges',
          MICROSITE: 'https://www.shoppre.com',
          CHROME_EXTENSION: 'https://chrome.google.com/webstore/detail/' +
          'shoppre/ommifjgbmhnacgjolkhiekbklehhbgma',
        };
        break;
      case 'staging-member.shoppre.com':
        vars = {
          DOMAIN,
          PREFIX,
          CDN: 'https://staging-cdn.shoppre.com',
          QNOTIFY_SERVER: 'https://s-qnotify.shoppre.com/api',
          API: 'https://staging-api.shoppre.com/api',
          API_BASE: 'https://staging-api.shoppre.com',
          PARTNER_OAUTH_API: 'https://staging-api.shoppre.com/api/user',
          ACCOUNTS: '//staging-accounts.shoppre.com',
          APPLY: 'https://staging-apply.shoppre.com',
          HELP: 'https://www.shoppre.com/contact',
          OAUTH: '//staging-accounts.shoppre.com/authorise?client_id=member&response_type=code&' +
          'redirect_uri=https://staging-member.shoppre.com/access/oauth',
          PDF_JS: 'https://staging-pdfviewer.shoppre.com/web/viewer.html',
          CHAT_SERVER: 'https://staging-chat.shoppre.com',
          CHAT_APP: 'https://staging-comet.shoppre.com',
          SEARCH: 'https://staging-search.shoppre.com',
          STACKTRACEJS: false,
          BADGE: 'https://staging-www.shoppre.com/embed/badges',
          MICROSITE: 'https://staging-www.shoppre.com',
          CHROME_EXTENSION: 'https://chrome.google.com/webstore/detail/' +
          'staging-shoppre/dfjkfldgfpcagdehfmbhpefhjgabdjcc',
        };
        break;
      default: {
        vars = {
          DOMAIN,
          PREFIX,
          CDN: 'http://cdn.shoppre.test',
          BETA: true,
          ADMIN: 'http://admin.shoppre.test',
          QNOTIFY_SERVER: 'http://qnotify.shoppre.test/api',
          API_BASE: 'http://localhost:5000',
          API: 'http://api.shoppre.test/api',
          CRUX_API: 'http://crux-api.shoppre.test/api',
          PARTNER_OAUTH_API: 'http://api.shoppre.test/api/user',
          ACCOUNTS: '//accounts.shoppre.test',
          APPLY: 'http://apply.shoppre.test',
          HELP: 'https://www.shoppre.com/contact',
          OAUTH: '//accounts.shoppre.test/authorise?client_id=member&response_type=code&' +
        'redirect_uri=http://member.shoppre.test/access/oauth',
          PDF_JS: 'http://pdfviewer.shoppre.test/web/viewer.html',
          CHAT_SERVER: 'http://chat.shoppre.test',
          CHAT_APP: 'http://comet.shoppre.test',
          SEARCH: 'http://search.shoppre.test',
          BADGE: 'https://staging-www.shoppre.com/embed/badges',
          MICROSITE: 'http://www.shoppre.test',
          CHROME_EXTENSION: 'https://chrome.google.com/webstore/detail/' +
          'staging-shoppre/dfjkfldgfpcagdehfmbhpefhjgabdjcc',
        };
      }
    }
    return vars;
  });
