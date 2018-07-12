(() => {
  class AllocationDisableService {
    /* @ngInject */
    constructor($state, $q, $http, $uibModal, Session, Auth) {
      this.$state = $state;
      this.$uibModal = $uibModal;
      this.$q = $q;
      this.$http = $http;
      this.$uibModal = $uibModal;
      this.Session = Session;
      this.Auth = Auth;
      this.AGE = 0;
      this.MAX_AGE = 5;
      this.user = this.Session.read('userinfo');
      this.data = {};
    }

    check() {
      if (!this.user) return this.Auth.setSessionData().then(() => this.check());

      if (this.AGE || this.data.qdirect_pending_jds) {
        return this.$q.resolve(this.AGE > this.MAX_AGE || this.data.qdirect_pending_jds);
      }

      return this
        .$http
        .get('/jobAllocations/disabled')
        .then(({ data }) => {
          const freeze = !this.user.is_active
            || ((this.AGE = data.avg_feedback_days)
            && (data.avg_feedback_days > this.MAX_AGE));

          this.data = data;
          if (this.user.admin_flag) return (this.data.qdirect_remaining_jds = 0);

          if (freeze) return (this.AGE > this.MAX_AGE);
          if (this.data.qdirect_pending_jds) return this.data.qdirect_pending_jds;

          return false;
        });
    }

    open() {
      if ((this.AGE < this.MAX_AGE) && this.data.qdirect_pending_jds) {
        return (this.$state.go('jobs.forceAllocation'));
      }

      const user = this.Session.read('userinfo');
      const one = [
        'Your account is partially frozen because average age for candidates in 2',
        `statuses is <code>${Math.round(this.AGE)}</code> days`,
      ].join(' ');

      const two = [
        'To auto unfreeze your account and start uploading CV\'s again, reduce',
        `average age to below ${this.MAX_AGE} days`,
      ].join(' ');

      const subol = [
        'Provide availability of candidates in <code>Scheduling Pending</code>' +
        ' and <code>Candidate Availability Pending</code>',
        ' Mark candidate as Interview backout. In case back out candidate is available in' +
        ' future, you can mark status back',
      ].join('</li><li>');

      const three = `Two ways to reduce age instantly:<ol type="a"><li>${subol}</li></ol>`;

      const agreementNotice = [
        'We have revised the QuezX agreement.',
        'Please inform your admin to login and accept the agreement.',
      ].join(' ');
      const template = `<div class='text-light-dker text-lg wrapper-md'></li></ol>${
        (!user.is_active)
          ? [agreementNotice].join('</li><li>')
          : `</li></ol>${[one, two, three].join('</li><li>')}</li></ol>`
      }</div>`;
      return this
        .$uibModal
        .open({ size: 'md', animation: true, template })
        .result;
    }
  }

  angular
    .module('uiGenApp')
    .service('AllocationDisable', AllocationDisableService);
})();
