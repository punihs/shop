
class ChangeShipmentStateController {
  /*  @ngInject   */
  constructor($uibModalInstance, $http, shpmt, Session, stateId, moment, customerId) {
    this.$uibModalInstance = $uibModalInstance;
    this.$http = $http;
    this.shpmt = shpmt;
    this.Session = Session;
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
          .get(`/shipments/${this.shpmt.id}/items`)
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
      .put(`/shipments/${this.shpmt.id}/state`, this.data)
      .then(() => {
        this.$uibModalInstance.close(this.data);
        this.submitting = false;
        return location.reload(true);
      })
      .catch((response) => {
        this.submitting = false;
        this.changeStateError = response.error;
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

  open(shpmt, stateId, customerId) {
    const modalInstance = this.$uibModal.open({
      templateUrl: 'app/directives/change-shipment-state/change-shipment-state.html',
      controller: ChangeShipmentStateController,
      controllerAs: '$ctrl',
      bindToController: 'true',
      size: 'md',
      resolve: {
        shpmt: () => shpmt,
        stateId: () => stateId,
        customerId: () => customerId,
      },
    });

    modalInstance
      .result
      .then((data) => {
        this.shpmt.state_id = data.state_id;
        this.shpmt.state_name = this.states[data.state_id].action;
      });
  }
}

angular.module('uiGenApp')
  .service('ChangeShipmentState', ChangeShipmentStateService);
