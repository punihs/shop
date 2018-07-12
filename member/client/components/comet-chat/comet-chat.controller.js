class CometChatController {
  /* @ngInject */
  constructor($http, $window, $scope, Session, URLS) {
    this.$http = $http;
    this.$window = $window;
    this.$scope = $scope;
    this.Session = Session;
    this.CHAT_APP = URLS.CHAT_APP;
    this.$onInit();
  }

  $onInit() {
    this.user = this.Session.read('userinfo');
    if (this.user) {
      this
        .$http.get(`/clients/${this.user.client_id}`, {
          params: {
            fl: 'EngagementManager',
          },
        })
        .then(({ data: { eng_mgr_id: EM_ID } }) => (this.EM_ID = EM_ID));

      // eslint-disable-next-line angular/document-service
      const head = document.getElementsByTagName('head')[0];
      head.appendChild(this.createElement('link', {
        href: `${this.CHAT_APP}/cometchatcss.php`,
        type: 'text/css',
        rel: 'stylesheet',
        media: 'all',
      }));

      const cometjs = this.createElement('script', {
        src: `${this.CHAT_APP}/cometchatjs.php`,
        type: 'text/javascript',
        async: true,
      });
      head.appendChild(cometjs);

      cometjs.onload = () => {
        this.CHAT_AVAILABLE = true;
        this.$scope.$apply(this.CHAT_AVAILABLE);
      };
    }
  }

  open() {
    if (this.$window.jqcc) this.$window.jqcc.cometchat.chatWith(this.EM_ID);
  }

  createElement(type, options) {
    // eslint-disable-next-line angular/document-service
    const element = document.createElement(type);
    Object.keys(options)
      .forEach(option => {
        element[option] = options[option];
      });

    return element;
  }
}

angular.module('uiGenApp')
  .controller('CometChatController', CometChatController);

