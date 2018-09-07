class CustomerViewController {
  /* @ngInject */
  constructor(URLS, $http, Page, $stateParams, $sce, $window, QCONFIG, currentCustomer,
    $state, $log, Session, $uibModal) {
    this.URLS = URLS;
    this.$http = $http;
    this.Page = Page;
    this.$stateParams = $stateParams;
    this.trustAsHtml = $sce.trustAsHtml;
    this.trustSrc = $sce.trustAsResourceUrl;
    this.$window = $window;
    this.QCONFIG = QCONFIG;
    this.currentCustomer = currentCustomer;
    this.$state = $state;
    this.$log = $log;
    this.Session = Session;
    this.user = this.Session.read('userinfo');

    this.$uibModal = $uibModal;

    if (!this.currentCustomer) {
      this.$state.go('customers.list');
      return;
    }
    this.customer = this.currentCustomer;

    this.buckets = this.QCONFIG.APPLICANT_STATES;
    this.Page.setTitle(`${this.customer.name}`);
    this.data = this.customer;
  }
}


angular.module('uiGenApp').controller('CustomerViewController', CustomerViewController);
