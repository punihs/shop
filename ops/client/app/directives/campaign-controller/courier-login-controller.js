class CampaignController {
  constructor(URLS, $window, Session, $http, Auth) {
    this.URLS = URLS;
    this.$window = $window;
    this.Session = Session;
    this.$http = $http;
    this.Auth = Auth;
    this.$onInIt();
  }

  $onInIt() {
    this.user = this.Session.read('adminUserinfo');
  }

  accessCampaign() {
    this.authorise();
  }

  authorise() {
    const CAMPAIGN = 10;
    const data = {
      grant_type: 'loginAs',
      username: this.user.email,
      app_id: CAMPAIGN,
    };
    const method = 'post';
    return this
      .$http[method]('~~/api/authorise', data)
      .then(({ data: redirectUrl }) => {
        this.$window.open(redirectUrl, '_blank');
      });
  }
}

angular
  .module('uiGenApp')
  .controller('CampaignController', CampaignController);
