class FeedIndexController {
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
    this.buckets = ['PACKAGE', 'SHIPMENT'];
    this.redirectUrl = '';
    this.currentBucket = this.$stateParams.bucket;

    if (this.$stateParams.bucket === 'PACKAGE') {
      this.redirectUrl = 'package.show';
      this.getPackageComments();
    } else {
      this.redirectUrl = 'shipment.show';
      this.getShipmentComments();
    }
  }

  getPackageComments() {
    this.$http.get(`/packages/comments`)
      .then(({ data }) => {
        console.log('response', this.comments);
        this.comments = data;
      });
  }

  getShipmentComments() {
    this.$http.get(`/shipments/comments`)
      .then(({ data }) => {
        this.comments = data;
      });
  }
}


angular.module('uiGenApp')
  .controller('FeedIndexController', FeedIndexController);
