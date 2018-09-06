
angular.module('uiGenApp')
  .factory('URLS', () => {
    let vars;
    switch (window.location.host) {
      case 'ops.shoppre.com':
        vars = {
          QNOTIFY_SERVER: 'https://qnotify.shoppre.com/api',
          API: 'https://api.shoppre.com/api',
          API_BASE: 'https://api.shoppre.com',
          ACCOUNTS: '//accounts.shoppre.com',
          APPLY: 'https://apply.shoppre.com',
          HELP: 'https://www.shoppre.com/contact',
          OAUTH: '//accounts.shoppre.com/authorise?client_id=ops&response_type=code&' +
          'redirect_uri=https://ops.shoppre.com/access/oauth',
          PDF_JS: 'https://pdfviewer.shoppre.com/web/viewer.html',
          CHROME_EXTENSION: 'https://chrome.google.com/webstore/detail/' +
          'shoppre/ommifjgbmhnacgjolkhiekbklehhbgma',
        };
        break;
      case 'staging-ops.shoppre.com':
        vars = {
          QNOTIFY_SERVER: 'https://s-qnotify.shoppre.com/api',
          API: 'https://staging-api.shoppre.com/api',
          API_BASE: 'https://staging-api.shoppre.com',
          ACCOUNTS: '//staging-accounts.shoppre.com',
          HELP: 'https://www.shoppre.com/contact',
          OAUTH: '//staging-accounts.shoppre.com/authorise?client_id=ops&response_type=code&' +
          'redirect_uri=https://staging-ops.shoppre.com/access/oauth',
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
          BETA: true,
          CDN: 'https://staging-cdn.shoppre.com',
          ADMIN: 'http://admin.shoppre.test',
          QNOTIFY_SERVER: 'http://qnotify.shoppre.test/api',
          API_BASE: 'http://localhost:5000',
          API: 'http://api.shoppre.test/api',
          ACCOUNTS: '//accounts.shoppre.test',
          HELP: 'https://www.shoppre.com/contact',
          OAUTH: '//accounts.shoppre.test/authorise?client_id=ops&response_type=code&' +
        'redirect_uri=http://ops.shoppre.test/access/oauth',
          PDF_JS: 'http://pdfviewer.shoppre.test/web/viewer.html',
          CHROME_EXTENSION: 'https://chrome.google.com/webstore/detail/' +
          'staging-shoppre/dfjkfldgfpcagdehfmbhpefhjgabdjcc',
        };
      }
    }
    return vars;
  });
