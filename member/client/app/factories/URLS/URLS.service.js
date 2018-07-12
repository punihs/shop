'use strict';

angular.module('uiGenApp')
  .factory('URLS', function () {
    var vars = {
      BETA: true,
      ADMIN: 'http://admin.shoppre.test',
      QNOTIFY_SERVER: 'http://qnotify.shoppre.test/api',
      API: 'http://api.shoppre.test/api',
      CRUX_API: 'http://crux-api.shoppre.test/api',
      PARTNER_OAUTH_API: 'http://api.shoppre.test/api/user',
      ACCOUNTS: '//accounts.shoppre.test',
      APPLY: 'http://apply.shoppre.test',
      HELP: 'https://www.shoppre.com/contact',
      OAUTH: '//accounts.shoppre.test/authorise?client_id=ops&response_type=code&' +
      'redirect_uri=http://ops.shoppre.test/access/oauth',
      PDF_JS: 'http://pdfviewer.shoppre.test/web/viewer.html',
      CHAT_SERVER: 'http://chat.shoppre.test',
      CHAT_APP: 'http://comet.shoppre.test',
      SEARCH: 'http://search.shoppre.test',
      STACKTRACEJS: false,
      BADGE: 'https://staging-www.shoppre.com/embed/badges',
      MICROSITE: 'http://www.shoppre.test',
      CHROME_EXTENSION: 'https://chrome.google.com/webstore/detail/staging-shoppre/dfjkfldgfpcagdehfmbhpefhjgabdjcc',
    };
    switch (window.location.host) {
      case 'ops.shoppre.com':
        vars = {
          BETA: false,
          ADMIN: 'https://admin.shoppre.com',
          QNOTIFY_SERVER: 'https://qnotify.shoppre.com/api',
          API: 'https://api.shoppre.com/api',
          CRUX_API: 'https://capi.shoppre.com/api',
          PARTNER_OAUTH_API: 'https://api.shoppre.com/api/user',
          ACCOUNTS: '//accounts.shoppre.com',
          APPLY: 'https://apply.shoppre.com',
          HELP: 'https://www.shoppre.com/contact',
          OAUTH: '//accounts.shoppre.com/authorise?client_id=ops&response_type=code&' +
          'redirect_uri=https://ops.shoppre.com/access/oauth',
          PDF_JS: 'https://pdfviewer.shoppre.com/web/viewer.html',
          CHAT_SERVER: 'https://chat.shoppre.com',
          CHAT_APP: 'https://comet.shoppre.com',
          SEARCH: 'https://search.shoppre.com',
          STACKTRACEJS: false,
          BADGE: 'https://www.shoppre.com/embed/badges',
          MICROSITE: 'https://www.shoppre.com',
          CHROME_EXTENSION: 'https://chrome.google.com/webstore/detail/shoppre/ommifjgbmhnacgjolkhiekbklehhbgma',
        };
        break;
      case 'staging-ops.shoppre.com':
        vars = {
          BETA: true,
          ADMIN: 'https://staging-admin.shoppre.com',
          QNOTIFY_SERVER: 'https://s-qnotify.shoppre.com/api',
          API: 'https://staging-api.shoppre.com/api',
          CRUX_API: 'https://s-capi.shoppre.com/api',
          PARTNER_OAUTH_API: 'https://staging-api.shoppre.com/api/user',
          ACCOUNTS: '//staging-accounts.shoppre.com',
          APPLY: 'https://staging-apply.shoppre.com',
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
          CHROME_EXTENSION: 'https://chrome.google.com/webstore/detail/staging-shoppre/dfjkfldgfpcagdehfmbhpefhjgabdjcc',
        };
        break;
    }
    return vars;
  });
