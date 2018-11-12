class PackagesIndexController {
  constructor(
    $http, Page, $uibModal, $stateParams, CONFIG, $location, $state, Session, S3,
    toaster, moment, URLS, AddComment, PhotoService) {
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
    this.Session = Session;
    this.URLS = URLS;
    this.AddComment = AddComment;
    this.PhotoService = PhotoService;
    return this.$onInit();
  }

  $onInit() {
    this.isPaymentSubmit = false;
    this.MoreOption = false;
    this.allChecked = false;

    this.store = 'Amazon';

    this.totalItemAmount = 0;
    this.totalSelectedPackages = 0;

    this.readyToShipCount = '';
    this.inReviewCount = '';
    this.actionRequiredCount = '';
    this.allCount = '';
    this.queueCount = '';
    this.facets = [];
    this.data = {};

    this.selectPackage = [];
    this.packages_ids = [];

    this.user = this.Session.read('userinfo');
    this.PACKAGE_STATE_IDS = this.CONFIG.PACKAGE_STATE_IDS;
    this.buckets = this.CONFIG.PACKAGE_STATES.map(x => x.replace(/ /g, '_').toUpperCase());

    // Set default bucket to ALL
    if (!this.buckets.includes(this.$stateParams.bucket)) {
      this.$state.go('packages.index', { bucket: this.buckets[0] });
      return;
    }
    this.Page.setTitle(`${this.$stateParams.bucket} Packages`);

    this.packages = []; // collection of packages
    this.master = []; // Master is for reset values to original values
    this.ui = { lazyLoad: true, loading: false }; // ui states
    this.xquery = '';
    this.params = {
      sort: '-', offset: 0, limit: 15, q: this.xquery || '',
      fl: 'id,name,state_id,state_name',
      sid: this.$stateParams.sid || '',
    };

    this.Page.setTitle('Locker');

    this.getList();
    this.loadMessages();
  }

  loadMessages() {
    this.specialRequests = [{
      name: 'Return to Sender',
      value: 'return',
      price: '₹ 400',
      acceptanceMessage: 'I understand that I will have to pay a fee ' +
      'of  ₹ 400 for the return.',
      infoContent: 'Once the item arrives at our facility, ' +
      'if you feel the item is not as per your expectation or is damaged, ' +
      'it can be exchanged/returned to the seller (as per the seller exchange/return policy). ' +
      'The cost for returning at item is charged at  ₹ 400*. ' +
      'You will be responsible for all return shipping fees as well (if needed).' +
      ' If it has to be couriered to sender’s destination by Shoppre, ' +
      'charges as per domestic shipping rates will be considered.' +
      ' *Charges may be lesser for Membership Partners, and Loyalty Members (Silver and above).',
      description: '(which will be displayed under Shoppre Wallet,and you shall pay along ' +
      'with your next shipment)',
      innerDescription: 'Please check with the Sender\'s Return Policy' +
      ' before you ask us to return' +
      ' your items. You can mention in the box below if you would like us to send' +
      ' the items to your Sender ' +
      '(please mention the full address with Pincode - charges as per domestic shipment)' +
      ' or if the sender' +
      ' will pick up your items from Shoppre.',
    }, {
      name: 'Split Package',
      value: 'split',
      price: ' ₹ 200 * Per New Package Created',
      acceptanceMessage: 'I understand that I will have to pay a fee ' +
      'of  ₹ 200 for the split package.',
      infoContent: 'Shoppre can split your package if it contains more than one item, and if you ' +
      'wish to separate them into multiple packages. ' +
      'You can split your package and discard an item, ' +
      'return it to the sender, ship it at a different time or to a different address. ' +
      'There is a cost of  ₹ 200 per new package* created. For eg. if you have splitted ' +
      'your package into 3, you will be charged  ₹ 400 .' +
      '*Charges may be lesser for Membership Partners, ' +
      'and Loyalty Members (Silver and above).',
      description: 'Split  contents of package separate packages',
      innerDescription: 'How would you like to split your package? Please mention ' +
      'the details in the box below:',
    }, {
      name: 'Abandon Package',
      value: 'abandon',
      price: ' ₹ 0 ',
      infoContent: ' Once Abandon Your Package' +
      'shall not able to recover.',
      description: 'Our team will dispose of the package and its contents',
      innerDescription: 'Are you sure that you wish to Abandon this Package? You ' +
      'shall not able to recover' +
      ' this package once you have asked us to discard your items.',
    }];
  }

  startUpload(ctrl, file) {
    ctrl.S3.upload(file, ctrl.data, ctrl);
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
        if (this.$stateParams.bucket === 'ACTION_REQUIRED') {
          this
            .toaster
            .pop('sucess', 'Package values Updated');
          this.packages.splice(this.packages.findIndex(l => (l.id === id)), 1);
          this.facets.ACTION_REQUIRED -= 1;
          this.facets.IN_REVIEW += 1;
        } else {
          this
            .toaster
            .pop('sucess', 'Changed Package Values in Ready to Send');
          this.packages.splice(this.packages.findIndex(l => (l.id === id)), 1);
          this.facets.READY_TO_SEND -= 1;
          this.facets.IN_REVIEW += 1;
        }
      }).catch(() => {
        this
          .toaster
          .pop('error', 'Error updating values');
      });
  }

  replaceCharWithSpace(input, char) {
    if (!input) return '';

    const text = input.replace(new RegExp(char, 'g'), ' ');
    console.log(text);
    return text;
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

  copied() {
    this.toaster.pop('success', 'Copied');
  }

  getList() {
    let packageIds = null;
    this.$http
      .get('/packages', { params: { bucket: this.$stateParams.bucket } })
      .then(({ data: { packages, facets, queueCount, paymentCount } }) => {
        packageIds = packages.map((x) => x.id);

        this.master.push(...packages);
        this.queueCount = queueCount;
        this.isPaymentSubmit = !!paymentCount;

        this.facets = facets;

        this.$http
          .get(`/packages/items/damaged?packageIds=${packageIds}`)
          .then(({ data: { packageStates } }) => {
            const damagedIds = packageStates.map(x => x.package_id);

            this.master.forEach((x) => {
              if (damagedIds.includes(x.id)) {
                Object.assign(x, { damaged: true });
              }
            });

            this.packages = angular.copy(this.master);
          });
      });
  }

  submitInvoice(id) {
    this.$http
      .put(`/packages/${id}/invoice`, { object: this.data.object })
      .then(({ data: { message } }) => {
        this.packages.splice(this.packages.findIndex(l => (l.id === id)), 1);
        this.facets.ACTION_REQUIRED -= 1;
        this.facets.IN_REVIEW += 1;
        this.data.object_thumb = null;
        this
          .toaster
          .pop('sucess', message);
      });
  }

  resetValues() {
    this.packages = angular.copy(this.master);
  }

  openOffer(offer, id, value) {
    this.$uibModal.open({
      templateUrl: 'app/directives/special-request/special-request.html',
      controller: 'SpecialRequestController',
      controllerAs: '$ctrl',
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

  viewPhotos(index, packageDetail) {
    const modal = this.PhotoService.open(index, packageDetail);
    modal
      .result
      .then((data) => {
        this.packages.map((x) => {
          if (x.id === data.id) {
            let PhotoRequests = '';
            if (data.type === 'standard') {
              PhotoRequests = [{ status: '2', type: '1' }];
            } else if (data.type === 'advanced') {
              PhotoRequests = [{ status: '2', type: '2' }];
            }
            Object.assign(x, { PhotoRequests });
          }
        });
        const modal1 = this.PhotoService.open(index, this.packages[index]);
        modal1
          .result
          .then((result) => {
            this.packages.map((x) => {
              if (x.id === result.id) {
                if (result.type === 'standard') {
                  x.PhotoRequests.push({ status: '2', type: '1' });
                } else if (result.type === 'advanced') {
                  x.PhotoRequests.push({ status: '2', type: '2' });
                }
              }
            });
            this.PhotoService.open(index, this.packages[index]);
          });
      });
  }

  open(id, index) {
    const modal = this.AddComment.open(index, id);
    modal
      .result
      .then((data) => {
        this.packages[index].notes = data;
      });
  }

  createShipment() {
    const specialItems = this.packages.filter(x => x.isChecked).map(x => x.content_type);
    if (specialItems.includes('1') && specialItems.includes('2')) {
      this
        .toaster
        .pop('error', ' Packages containing special items must be chosen and shipped separately ');
      return;
    }
    const packageIds = this.packages.filter(x => x.isChecked).map(x => x.id);
    this.$state
      .go('shipRequests.create', { packageIds });
  }
}

angular
  .module('uiGenApp')
  .controller('PackagesIndexController', PackagesIndexController);
