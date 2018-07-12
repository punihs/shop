/* eslint-disable array-callback-return,no-param-reassign */
class CandidateController {
  constructor($uibModalInstance, $http, $uibModal, $stateParams, $state, Session, $timeout) {
    this.$uibModal = $uibModal;
    this.$uibModalInstance = $uibModalInstance;
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.$state = $state;
    this.Session = Session;
    this._ = _;
    this.parseInt = parseInt;
    this.$timeout = $timeout;
    this.$onInit();
  }

  $onInit() {
    this.facet = '';
    this.filtered = {};
    this.ui = {
      selected: {},
      selectAll: {},
    };
    this.possibleStateList = this.Session.read('states');
    this.fetchFacets();
  }

  fetchFacets() {
    const ctc = [{
      name: 'Min',
      val: 0,
    }, {
      name: 'Max',
      val: 0,
    }];
    this.$http
    .get('/applicants/facets', {
      params: { status: this.$stateParams.status, jid: this.$stateParams.jobId },
    })
    .then(({ data: { stateIds } }) => {
      const selectedStatus = this.$stateParams.sid ?
        this.$stateParams.sid.split(',').map(key => this.parseInt(key)) :
        [];
      this.filtered = {
        status: stateIds.map(id => ({
          id,
          action: this._.filter(this.possibleStateList,
            state => (state !== null && state.id === this.parseInt(id)))[0].action,
          checked: selectedStatus.includes(Number(id)),
        })),
        noticePeriod: [0, 15, 30, 45, 60, 90, 180].map(id => ({
          id,
          name: (!id ? 'immediate' : (`> ${id} Days`)),
          checked: false,
        })),
        ctc,
      };
      this.facet = Object.keys(this.filtered)[0];
      this.ui.selected[this.facet] = (this.$stateParams.sid || '').split(',').length;
    }).catch(err => console.log(err));
  }

  markAllSelect(key) {
    this.ui.selected[key] = 0;
    this.filtered[key].forEach(i => {
      const item = i;
      item.checked = this.ui.selectAll[key];
      if (item.checked) this.ui.selected[key] += 1;
    });
  }

  changedStatus(status, data, type) {
    this.filtered[type].map(x => {
      if (data.id === x.id && data.checked === x.checked) return;
      x.checked = false;
    });
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

  getMinCtc(applied) {
    if (this.filtered.ctc[1].val && !this.filtered.ctc[0].val) {
      applied.unshift(0);
    }
    return applied.join(',');
  }

  applyFilter() {
    const applied = Object.keys(this.filtered)
        .reduce((hash, type) => Object.assign(hash, {
          [type]: (type !== 'ctc') ? (this.filtered[type] && this.filtered[type]
              .filter(s => s.checked)
              .map(s => (s.id ? Number(s.id) : s.name))) :
            this.filtered[type].filter(s => s.val).map(s => Number(s.val)),
        }), {});

    this.$state.transitionTo(this.$state.current.name,
      Object.assign(this.$stateParams, {
        sid: applied.status && applied.status.join(','),
        vendors: applied.vendors && encodeURIComponent(applied.vendors.join(',')),
        notice_period: applied.noticePeriod[0] === 'immediate' ? 0 : applied.noticePeriod,
        ctc_range: applied.ctc && this.getMinCtc(applied.ctc),
      }));

    this.$uibModalInstance.close();
  }

  enableApply(type) {
    this.checked = false;
    this.ui.selectAll[type] = false;
    this.$timeout(() => {
      this.filtered[type].forEach(s => {
        if (s.checked) this.checked = true;
      });
    });
  }

  reset() {
    Object.keys(this.filtered)
      .forEach(type => {
        this.filtered[type].forEach(x => {
          const item = x;
          if (type === 'ctc') return (item.val = 0);
          this.ui.selectAll[type] = false;
          this.ui.selected[type] = 0;
          return (item.checked = false);
        });
      });
  }
}

angular.module('uiGenApp')
  .controller('CandidateController', CandidateController);
