
class ChangeShipmentStateController {
  /*  @ngInject   */
  constructor($uibModalInstance, $http, shipment, Session, stateId, moment, customerId, toaster) {
    this.$uibModalInstance = $uibModalInstance;
    this.$http = $http;
    this.shipment = shipment;
    this.Session = Session;
    this.toaster = toaster;
    this.stateId = stateId;
    this.moment = moment;
    this.customerId = customerId;
  }

  $onInit() {
    this.errors = {
      allPackageItemsScanned: 'Please scan barcode of all the items',
    };

    this.validations = {
      17: {
        allPackageItemsScanned: false,
      },
    };
    this.states = this.Session.read('shipment-states');
    this.today = new Date();
    this.ui = { checking: false };
    this.submitting = false;
    this.exData = {
      scheduled_on_time: this.moment()
        .startOf('day')
        .set('hour', 10),
    };
    this.preChecksDone = true;

    if (this.stateId === 17) this.getPackageItemsForValidation();

    switch (this.stateId) {
      case 2: {
        this.preChecksDone = false;
        this.$http
          .get(`/shipments/${this.shipment.id}/items`)
          .then(({ data: packageItems }) => {
            this.packageItems = packageItems;
          });
        break;
      }
      default: return;
    }
  }

  scan($event) {
    this.error = null;
    const packageItemId = this.package_item_id;
    if ($event.keyCode === 13) {
      const index = this.packageItems
        .findIndex(packageItem => (packageItem.id === Number(packageItemId)));

      if (index !== -1) this.packageItems[index].scanned = true;
      else this.error = `You scanned #${packageItemId}.Item not belongs to this ship request`;
      this.package_item_id = '';
    }

    this.validations[this.stateId].allPackageItemsScanned = this.packageItems.every(x => x.scanned);
  }

  getPackageItemsForValidation() {
    this.$http
      .get(`/shipments/${this.shipment.id}/validate`)
      .then(({ data: packageItems }) => {
        this.packageItems = packageItems
      });
  }

  ok() {
    if (this.submitting) return;
    const paymentConfirmed = 22;
    this.submitting = true;
    const validations = this.validations[this.stateId];

    this.error = null;
    let invalidKey;
    const valid = Object.keys(validations || {}).every(key => {
      invalidKey = key;
      return validations[key];
    });

    if(!valid) {
      this.error = this.errors[invalidKey];
      this.submitting = false;
      return
    }

    this
      .$http
      .put(`/shipments/${this.shipment.id}/state`, this.data)
      .then(() => {
        this.$uibModalInstance.close(this.data);
        if (this.data.state_id === paymentConfirmed) {
          this
            .$http
            .put(`$/transactions/${this.shipment.transaction_id}?status=success`);
        }
        this.submitting = false;

        return location.reload(true);
      })
      .catch((response) => {
        this.submitting = false;
        this.changeStateError = response.error;
        this
          .toaster
          .pop('error', response.data.message);
      });
  }
}

class ChangeShipmentStateService {
  /*  @ngInject  */
  constructor($uibModal, Session) {
    this.$uibModal = $uibModal;
    this.Session = Session;
  }

  $onInit() {
    this.states = this.Session.read('shipment-states');
  }

  open(shipment, stateId, customerId) {
    const modalInstance = this.$uibModal.open({
      templateUrl: 'app/directives/change-shipment-state/change-shipment-state.html',
      controller: ChangeShipmentStateController,
      controllerAs: '$ctrl',
      bindToController: 'true',
      size: 'md',
      resolve: {
        shipment: () => shipment,
        stateId: () => stateId,
        customerId: () => customerId,
      },
    });

    modalInstance
      .result
      .then((data) => {
        this.shipment.state_id = data.state_id;
        this.shipment.state_name = this.states[data.state_id].action;
      });
  }
}

angular.module('uiGenApp')
  .service('ChangeShipmentState', ChangeShipmentStateService);
