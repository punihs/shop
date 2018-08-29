class PackageLockerController {
  constructor($http, Page, $uibModal, $stateParams, CONFIG, $location, $state, Session, S3,
              toaster, moment) {
    this.$http = $http;
    this.Page = Page;
    this.S3 = S3;
    this.$uibModal = $uibModal;
    this.$stateParams = $stateParams;
    this.$state = $state;
    this.CONFIG = CONFIG;
    this.$location = $location;
    this.moment = moment;
    this.toaster = toaster;
    this.user = Session.read('userinfo');
    this.MoreOption = false;
    this.allChecked = false;
    this.totalSelectedPackages = 0;
    this.selectPackage = [];
    this.packages_ids = [];
    this.$onInit();
    this.readyToShipCount = '';
    this.inReviewCount = '';
    this.actionRequiredCount = '';
    this.allCount = '';
    this.totalItemAmount = 0;
    this.data = {};
  }

  startUpload(ctrl, file) {
    ctrl.S3.upload(file, ctrl.data, ctrl);
  }

  $onInit() {
    this.buckets = this.CONFIG.PACKAGE_STATES.map(x => x.replace(/ /g, '_').toUpperCase());

    this.$stateParams.bucket = this.$stateParams.bucket || this.$location.search().bucket;
    this.store = 'Amazon';
    // Set default bucket to ALL
    if (!this.buckets.includes(this.$stateParams.bucket)) {
      this.$state.go('dash.packages', { bucket: this.buckets[0] });
      return;
    }
    this.Page.setTitle(`${this.$stateParams.bucket} Packages`);

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
      infoContent: 'Once the item arrives at our facility, ' +
      'if you feel the item is not as per your expectation or is damaged, ' +
      'it can be exchanged/returned to the seller (as per the seller exchange/return policy). ' +
      'The cost for returning at item is charged at INR 400*. ' +
      'You will be responsible for all return shipping fees as well (if needed).' +
      ' If it has to be couriered to sender’s destination by Shoppre, ' +
      'charges as per domestic shipping rates will be considered.' +
      ' *Charges may be lesser for Membership Partners, and Loyalty Members (Silver and above).',
      description: '(which will be displayed under Shoppre Wallet,and you shall pay along ' +
      'with your next shipment)' +
      'Return package to sender. You might to pay shipping charges as per' +
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
      infoContent: 'Shoppre can split your package if it contains more than one item, and if you ' +
      'wish to separate them into multiple packages. ' +
      'You can split your package and discard an item, ' +
      'return it to the sender, ship it at a different time or to a different address. ' +
      'There is a cost of INR 200 per new package* created. For eg. if you have splitted ' +
      'your package into 3, you will be charged INR 400 .' +
      '*Charges may be lesser for Membership Partners, ' +
      'and Loyalty Members (Silver and above).',
      description: 'Split  contents of package separate packages',
      innerDescription: 'How would you like to split your package? Please mention ' +
      'the details in the box below:',
    },
    {
      name: 'Abandon Package',
      value: 'abandon',
      price: 'INR 0 ',
      infoContent: ' Once Abandon Your Package' +
      'shall not able to recover.',
      description: 'Our team will dispose of the package and its contents',
      innerDescription: 'Are you sure that you wish to Abandon this Package? You ' +
      'shall not able to recover' +
      ' this package once you have asked us to discard your items.',
    }];

    this.getList();
    // totalItemAmount = items
    // this.getCount();
    // this.getQueueCount();
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
      .then(() => {
      });
    if (this.$stateParams.bucket === 'ACTION_REQUIRED') {
      this
        .toaster
        .pop('sucess', 'Package values Updated');
    } else {
      this
        .toaster
        .pop('sucess', 'Changed Package Values in Ready to Send');
    }
  }

  selectAllPackages(isChecked) {
    if (isChecked) {
      this.packages.forEach((item, index) => {
        this.packages[index].isChecked = true;
      });
      this.totalSelectedPackages = this.packages.length;
    } else {
      this.packages.forEach((item, index) => {
        this.packages[index].isChecked = false;
      });
      this.totalSelectedPackages = 0;
    }
  }

  selectPackages() {
    let count = 0;
    this.packages.forEach((item) => {
      if (item.isChecked) {
        count++;
      }
    });
    this.totalSelectedPackages = count;
    if (count === this.packages.length) {
      this.allChecked = true;
    } else {
      this.allChecked = false;
    }
  }

  // getQueueCount() {
  //   this
  //     .$http
  //     .get('/shipments/count?bucket=IN_QUEUE')
  //     .then(({ data: count }) => {
  //       this.queueCount = count;
  //     });
  // }

  copied() {
    this.toaster.pop('info', 'Copied');
  }

  getList() {
    this.$http
      .get('/packages', { params: { bucket: this.$stateParams.bucket } })
      .then(({ data: { packages } }) => {
        this.packages.push(...packages);
      });
  }

  submitInvoice(id) {
    this.$http
      .put(`/packages/${id}/invoice`, { object: this.data.object })
      .then(({ data: { message } }) => {
        this
          .toaster
          .pop('sucess', message);
      });
    this.packages = [];
    this.getList();
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
      size: 'lg',
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

  uploadPhotos(packageDetail) {
    this.$uibModal.open({
      templateUrl: 'app/directives/upload-photos/upload-photos.html',
      controller: 'UploadphotosCtrl',
      controllerAs: '$ctrl',
      size: 'lg',
      resolve: {
        packageDetail() {
          return packageDetail;
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
    // console.log(this.packages.filter(x => x.checked).map(x => x.id));
    const packageIds = this.packages.filter(x => x.checked).map(x => x.id);
    this.$state.go('dash.createShipmentRequest', { packageIds });
  }


}

angular
  .module('uiGenApp')
  .controller('PackageLockerController', PackageLockerController);
