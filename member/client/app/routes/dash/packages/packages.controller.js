class PackageLockerController {
  constructor($http, Page, $uibModal, $stateParams, CONFIG, $location, $state, Session, toaster) {
    this.$http = $http;
    this.Page = Page;
    this.$uibModal = $uibModal;
    this.$stateParams = $stateParams;
    this.$state = $state;
    this.CONFIG = CONFIG;
    this.$location = $location;
    this.moment = moment;
    this.toaster = toaster;
    this.user = Session.read('userinfo');
    this.MoreOption = false;
    this.$onInit();
  }

  $onInit() {
    this.buckets = this.CONFIG.PACKAGE_STATES.map(x => x.replace(/ /g, '_').toUpperCase());

    this.$stateParams.status = this.$stateParams.status || this.$location.search().status;
    this.store = 'Amazon';
    // Set default status to ALL
    if (!this.buckets.includes(this.$stateParams.status)) {
      this.$state.go('dash.packages', { status: this.buckets[0] });
      return;
    }
    this.Page.setTitle(`${this.$stateParams.status} Packages`);

    this.packages = []; // collection of packages
    this.ui = { lazyLoad: true, loading: false }; // ui states
    this.xquery = '';
    this.params = { sort: '-', offset: 0, limit: 15, q: this.xquery || '',
      fl: 'id,name,state_id,state_name',
      sid: this.$stateParams.sid || '',
    };

    this.Page.setTitle('Locker');

    this.specialRequests = [{
      name: 'Return to Sender',
      price: 'INR400',
      infoContent: 'hi',
      description: 'Return package to sender. You might to pay shipping charges as per' +
      ' the Return policy of the' +
      ' seller form where you purchased',
      innerDescription: 'InnerDescriptionPlease check with the Sender\'s Return Policy' +
      ' before you ask us to return' +
      ' your items. You can mention in the box below if you would like us to send' +
      ' the items to your Sender ' +
      '(please mention the full address with Pincode - charges as per domestic shipment)' +
      ' or if the sender' +
      ' will pick up your items from Shoppre.',
    },
    {
      name: 'Split Package',
      price: 'INR 200 * Per New Package Created',
      infoContent: 'hello',
      description: 'Split  contents of package separate packages',
      innerDescription: 'How would you like to split your package? Please mention ' +
      'the details in the box below:',
    },
    {
      name: 'Abandon Package',
      price: 'INR 0 ',
      infoContent: 'hkhkhk',
      description: 'Our team will disose of the package and its contents',
      innerDescription: 'Are you sure that you wish to Abandon this Package? You ' +
      'shall not able to recover' +
      ' this package once you have asked us to discard your items.',
    }];

    this.getList();
    this.getQueueCount();
  }

  getQueueCount() {
    this
      .$http
      .get('/shipments/count?status=IN_QUEUE')
      .then(({ data: count }) => {
        this.queueCount = count;
      });
  }

  copied() {
    this.toaster.pop('info', 'Copied');
  }

  getList() {
    this.$http
      .get('/packages', { params: { status: this.$stateParams.status } })
      .then(({ data: { packages } }) => {
        this.packages.push(...packages);
      });
  }

  openOffer(offer) {
    this.$uibModal.open({
      templateUrl: 'app/directives/download-resume/download-resume.html',
      controller: 'DownloadResumeCtrl',
      controllerAs: 'DownloadResume',
      size: 'lg',
      resolve: {
        offer() {
          return offer;
        },
      },
    });
  }
  uploadPhotos() {
    this.$uibModal.open({
      templateUrl: 'app/directives/upload-photos/upload-photos.html',
      controller: 'UploadphotosCtrl',
      controllerAs: 'UploadPhoto',
      size: 'lg',
    });
  }
  AddCommnet() {
    this.$uibModal.open({
      templateUrl: 'app/directives/add-comments/add-comments.html',
      controller: 'AddcommentCtrl',
      controllerAs: 'AddComment',
      size: 'md',
    });
  }
}
angular
  .module('uiGenApp')
  .controller('PackageLockerController', PackageLockerController);
