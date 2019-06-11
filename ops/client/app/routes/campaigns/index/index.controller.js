class CampaignIndexController {
  /* @ngInject */
  constructor(QCONFIG, $stateParams, moment, $window, Page, $http, $state, Session, Prototype,) {
    this.QCONFIG = QCONFIG;
    this.$stateParams = $stateParams;
    this.$http = $http;
    this.$state = $state;
    this.$window = $window;
    this.moment = moment;
    this.Session = Session;
    this.Prototype = Prototype;
    this.Page = Page;
    this.$onInit();
  }

  $onInit() {
    this.buckets = ['RUNNING', 'EXPIRED'];
    if (!this.buckets.includes(this.$stateParams.bucket)) {
      this.$state.go('campaigns.index', { bucket: 'RUNNING' });
      return;
    } else {
      this.getList();
    }
  }

  getList() {
    this.$http.get(`$/campaigns?bucket=${this.$stateParams.bucket}`)
      .then(({data: campaigns }) => {
        this.campaigns = campaigns;
      });
  }
}


angular.module('uiGenApp')
  .controller('CampaignIndexController', CampaignIndexController);
