
class ChangeStateController {
  /*  @ngInject   */
  constructor($uibModalInstance, $http, pkg, Session, stateId, moment, customerId, toaster) {
    this.$uibModalInstance = $uibModalInstance;
    this.$http = $http;
    this.pkg = pkg;
    this.Session = Session;
    this.stateId = stateId;
    this.moment = moment;
    this.toaster = toaster;
    this.customerId = customerId;
  }

  $onInit() {
    this.states = this.Session.read('states');
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
          .get(`/packages/${this.pkg.id}/items`)
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
    const paymentConfirmed = 63;
    this
      .$http
      .put(`/packages/${this.pkg.id}/state`, this.data)
      .then(() => {
        this.$uibModalInstance.close(this.data);
        if (this.data.state_id === paymentConfirmed) {
          this
            .$http
            .put(`$/transactions/${this.pkg.transaction_id}?status=success`);
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

class ChangeStateService {
  /*  @ngInject  */
  constructor($uibModal, Session) {
    this.$uibModal = $uibModal;
    this.Session = Session;
  }

  $onInit() {
    this.states = this.Session.read('states');
  }

  open(pkg, stateId, customerId) {
    const modalInstance = this.$uibModal.open({
      templateUrl: 'app/directives/change-state/change-state.html',
      controller: ChangeStateController,
      controllerAs: '$ctrl',
      bindToController: 'true',
      size: 'md',
      resolve: {
        pkg: () => pkg,
        stateId: () => stateId,
        customerId: () => customerId,
      },
    });

    modalInstance
      .result
      .then((data) => {
        this.pkg.state_id = data.state_id;
        this.pkg.state_name = this.states[data.state_id].action;
      });
  }
}

angular.module('uiGenApp')
  .service('ChangeState', ChangeStateService)
  .factory('StateChange', (ChangeState, ChangeShipmentState) => ({
    package: ChangeState,
    shipment: ChangeShipmentState,
  }));
