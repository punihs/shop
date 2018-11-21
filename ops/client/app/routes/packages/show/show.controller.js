class PackageShowController {
  /* @ngInject */
  constructor(
    $http, $stateParams, URLS, $sce, $state, $window, Page, Session, $q, ChangeState,
    pkg, ListModal, toaster, $scope, ViewPhotoService) {
    this.Number = Number;
    this.$scope = $scope;
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
    this.ViewPhotoService = ViewPhotoService;
    this.moment = moment;

    this.$onInit();
  }

  $onInit() {
    this.states = this.Session.read('states');
    this.user = this.Session.read('userinfo');

    this.location = this.$window.location;
    this.customer = this.data.Customer;

    this.Page.setFavicon(`${this.$stateParams.profilePhotoUrl}`);
    if (this.data.Store) this.Page.setTitle(this.data.Store.name);

    this.root = '_root_';
    this.modal = {};
    this.packageItemsAdditionAllowedStateIds = [1];
    this.editAllowedStates = [1, 2, 5];
    this.packageItems = [];
    this.charges = null;

    const { activeTab } = this.$stateParams;
    if (activeTab) this.$scope.activeTab = activeTab;

    this
      .$http
      .get(`/packages/${this.$stateParams.id}/items`)
      .then(({ data: packageItems }) => (this.packageItems.push(...packageItems)));
  }

  openPhoto(photo) {
    this.ViewPhotoService.open(photo);
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


  getCharges() {
    if (this.charges) return;
    this.chargesIcon = {
      storage_amount: 'fa-dropbox',
    };

    this
      .$http
      .get(`/packages/${this.$stateParams.id}/charges`)
      .then(({ data: charges }) => {
        this.charges = Object
          .keys(charges)
          .map(key => ({
            key,
            label: _.startCase(key.replace('_', ' ').toLowerCase()),
            chargeAmount: charges[key],
          }));
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

  deletePackage(packageid) {
    const c = confirm;
    const ok = c('Are you sure? Deleting Your Package');
    if (!ok) return null;

    return this
      .$http
      .delete(`/packages/${packageid}`)
      .then(({ data: { message } }) => {
        this.toaster
          .pop('success', message);
        this.$state.go('packages.index');
      })
      .catch(() => {
        this.toaster
          .pop('error', 'There was problem deleting package');
      });
  }

  deletePackageItem(packageid, itemId, index) {
    const c = confirm;
    const ok = c('Are you sure? Deleting Your Package Item');
    if (!ok) return null;

    return this
      .$http
      .delete(`/packages/${packageid}/item/${itemId}/delete`)
      .then(({ data: { message } }) => {
        this.toaster
          .pop('success', message);
        return this.packageItems.splice(index, 1);
      })
      .catch((err) => {
        let message = '';
        message = err.status === 403 ?
          err.data.message : 'There was problem deleting package item';
        this.toaster
          .pop('error', message);
      });
  }
}

angular.module('uiGenApp')
  .controller('PackageShowController', PackageShowController);
