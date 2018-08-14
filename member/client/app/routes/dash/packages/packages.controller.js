class PackageLockerController {
  constructor($http, Page, $uibModal, $stateParams, CONFIG, $location, $state, Session,
              toaster, moment, $scope) {
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
    this.selectPackage = [];
    this.packages_ids = [];
    this.$onInit();
    this.readyToShipCount = '';
    this.inReviewCount = '';
    this.actionRequiredCount = '';
    this.allCount = '';
    this.totalItemAmount = 0;
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
    this.params = {
      sort: '-', offset: 0, limit: 15, q: this.xquery || '',
      fl: 'id,name,state_id,state_name',
      sid: this.$stateParams.sid || '',
    };

    this.Page.setTitle('Locker');

    this.specialRequests = [{
      name: 'Return to Sender',
      value: 'return',
      price: 'INR400',
      infoContent: 'hi',
      description: 'Return package to sender. You might to pay shipping charges as per' +
      ' the Return policy of the' +
      ' seller form where you purchased',
      innerDescription: 'Please check with the Sender\'s Return Policy' +
      ' before you ask us to return' +
      ' your items. You can mention in the box below if you would like us to send' +
      ' the items to your Sender ' +
      '(please mention the full address with Pincode - charges as per domestic shipment)' +
      ' or if the sender' +
      ' will pick up your items from Shoppre.',
    },
    {
      name: 'Split Package',
      value: 'split',
      price: 'INR 200 * Per New Package Created',
      infoContent: 'hello',
      description: 'Split  contents of package separate packages',
      innerDescription: 'How would you like to split your package? Please mention ' +
      'the details in the box below:',
    },
    {
      name: 'Abandon Package',
      value: 'abandon',
      price: 'INR 0 ',
      infoContent: 'hkhkhk',
      description: 'Our team will disose of the package and its contents',
      innerDescription: 'Are you sure that you wish to Abandon this Package? You ' +
      'shall not able to recover' +
      ' this package once you have asked us to discard your items.',
    }];

    this.getList();
    // totalItemAmount = items
    // this.getCount();
    // this.getQueueCount();

    this.orgiinalList = [];
    this.orgiinalList = this.packages;
    //   this.packages.forEach(item => {
    //   this.orgiinalList.push(item);
    // });
  }

  getTotalItemAmount(index) {
    let total = 0;
    this.packages[index].PackageItems.forEach((item) => {
      total += item.price_amount * item.quantity;
    });
    this.totalItemAmount = total;
  }

  submitValues(id, index) {
    const itemValues = this.packages[index].PackageItems;
    this.$http
      .put(`/packageItems/${id}/values`, itemValues)
      .then(({ data: { packages } }) => {
      });
    if (this.$stateParams.status === 'ACTION_REQUIRED') {
      this
        .toaster
        .pop('sucess', 'Package values Updated');
    } else {
      this
        .toaster
        .pop('sucess', 'Changed Package Values in Ready to Send');
    }
  }


  // getQueueCount() {
  //   this
  //     .$http
  //     .get('/shipments/count?status=IN_QUEUE')
  //     .then(({ data: count }) => {
  //       this.queueCount = count;
  //     });
  // }

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


  resetValues() {
  }

  // getCount() {
  //   this.$http
  //     .get('/packages/646/count')
  //     .then(({ data: { readyToShipCount, inReviewCount, actionRequiredCount, allCount } }) => {
  //       console.log(readyToShipCount, inReviewCount, actionRequiredCount, allCount);
  //       this.readyToShipCount = readyToShipCount;
  //       this.inReviewCount = inReviewCount;
  //       this.actionRequiredCount = actionRequiredCount;
  //       this.allCount = allCount;
  //     });
  // }

  openOffer(offer, id, value) {
    this.$uibModal.open({
      templateUrl: 'app/directives/download-resume/download-resume.html',
      controller: 'DownloadResumeCtrl',
      controllerAs: 'DownloadResume',
      size: 'md',

      resolve: {
        id() {
          return id;
        },
        value() {
          return value;
        },
        offer() {
          return offer;
        },
      },
    });
    this.$state.reload();
  }

  uploadPhotos(id) {
    this.$uibModal.open({
      templateUrl: 'app/directives/upload-photos/upload-photos.html',
      controller: 'UploadphotosCtrl',
      controllerAs: '$ctrl',
      bindToController: 'true',
      size: 'md',
      resolve: {
        id() {
          return id;
        },
      },
    });
  }

  AddCommnet(id) {
    this.$uibModal.open({
      templateUrl: 'app/directives/add-comments/add-comments.html',
      controller: 'AddcommentCtrl',
      controllerAs: '$ctrl',
      size: 'md',
      resolve: {
        id() {
          return id;
        },
      },
    });
  }

  createShipment() {
    console.log(this.packages.filter(x => x.checked).map(x => x.id)); // - required
  }


}

angular
  .module('uiGenApp')
  .controller('PackageLockerController', PackageLockerController);
