class PackageShowController {
  /* @ngInject */
  constructor(
    $http, $stateParams, URLS, $sce, $state, $window, Page, Session, $q, ChangeState,
    pkg, JobModal, ListModal, toaster
  ) {
    this.Number = Number;
    this.URLS = URLS;
    this.$sce = $sce;
    this.$http = $http;
    this.$state = $state;
    this.Page = Page;
    this.Session = Session;
    this.$q = $q;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.ChangeState = ChangeState;
    this.data = pkg;
    this.ListModal = ListModal;
    this.moment = moment;
    this.customer = pkg.Customer;
    this.editAllowedStates = [1, 2, 3];
    this.location = $window.location;
    this.user = Session.read('userinfo');
    this.$onInit();
  }

  $onInit() {
    this.root = '_root_';
    this.modal = {};
    this.states = this.Session.read('states');
    this.user = this.Session.read('userinfo');
    this.Page.setTitle(this.data.Store.name);
    this.packageItems = [];

    this
      .$http
      .get(`/packages/${this.$stateParams.id}/items`)
      .then(({ data: packageItems }) => (this.packageItems.push(...packageItems)));
  }

  setMessage(description) {
    this.modal = {
      modalButtons: [{ name: 'OK', type: 'default' }],
      title: 'Action Required',
      description,
    };
    this.ListModal.open(this.modal, 'popup');
  }

  chatHoverText() {
    return `Initiate chat with ${this.data.name}`;
  }

  awfTime() {
    const [time] = this.data.comments.filter(c => c.state_id === 1);
    return time;
  }

  toggleBookmark(status) {
    this
      .$http
      .post(`/packages/${this.$stateParams.id}/bookmarks`, { status })
      .then(() => {
        this.data.is_bookmarked = status;
        this.toaster
          .pop('success',
            (status
              ? 'Bookmarked Successfully'
              : 'Unbookmarked Successfully'
            ));
      })
      .catch(() => {
        this.toaster
          .pop('error', 'There was problem loading data. Please contact ShoppRe team');
      });
  }

  uploadFiles(files) {
    this.$q
      .all(files
        .map((file) => this
        .$http
          .post(`/package/${this.$stateParams.id}/items`, {
            documentFile: file,
          })))
      .then((docs) => {
        const data = docs.map(file => {
          const { id, filename, link } = file.data;
          return { id, filename, link };
        });
        this.document = [...this.document, ...data];
      }
      );
  }

  deleteDocument(id, key) {
    this
      .$http
      .delete(`/package/${id}/items`)
      .then(() => this.document.splice(key, 1));
  }
}

angular.module('uiGenApp')
  .controller('PackageShowController', PackageShowController);
