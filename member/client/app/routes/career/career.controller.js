class CareerController {
  constructor($state, $timeout, $sce, $http, Session, URLS, QuarcService, CareerModal, toaster) {
    this.$state = $state;
    this.$timeout = $timeout;
    this.$sce = $sce;
    this.$http = $http;
    this.Session = Session;
    this.URLS = URLS;
    this.QuarcService = QuarcService;
    this.CareerModal = CareerModal;
    this.toaster = toaster;
    this.user = this.Session.read('userinfo');
    if (!this.user.franchise) return this.$state.go('dashboard');
    this.$onInit();
  }

  $onInit() {
    this.ui = { site: '' };
    const Page = this.QuarcService.Page;
    Page.setTitle('Career Page');
    this.getClient();
  }

  getClient() {
    this
      .$http
      .get('/clients/company')
      .then(({ data }) => {
        this.data = data;
        this.ui.site = this.$sce.trustAsResourceUrl(`${this.URLS.MICROSITE}/${data.slug}`);
        this.links = {
          google: `https://plus.google.com/share?url=${this.ui.site}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${this.ui.site}`,
          twitter: `http://twitter.com/share?url=${this.ui.site}`,
          linkedIn: `https://www.linkedin.com/shareArticle?url=${this.ui.site}&source=Quezx.com`,
        };
      });
  }

  save() {
    this
      .$http
      .post('/clients/company', this.data)
      .then(() => {
        this.ui.site = '';
        this.toaster.pop(this.QuarcService.toast('success', 'Update Successfully', ''));
        this.$timeout(() => {
          this.ui.site = this.$sce.trustAsResourceUrl(`${this.URLS.MICROSITE}/${this.data.slug}`);
        }, 1000);
      });
  }
}

angular.module('uiGenApp')
  .controller('CareerController', CareerController);
