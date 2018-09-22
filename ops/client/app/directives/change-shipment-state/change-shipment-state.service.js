
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

  ok() {
    if (this.submitting) return;
    this.submitting = true;
    this
      .$http
      .put(`/shipments/${this.shipment.id}/state`, this.data)
      .then(() => {
        this.$uibModalInstance.close(this.data);
        this.submitting = false;
        return location.reload(true);
      })
      .catch((response) => {
        this.submitting = false;
        this.changeStateError = response.error;
        this
          .toaster
          .pop('success', response.data.message);
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
