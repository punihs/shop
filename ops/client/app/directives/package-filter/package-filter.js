class PackageFilterController {
  /* @ngInject */
  constructor($uibModalInstance, $scope, $filter, Session, all) {
    this.$uibModalInstance = $uibModalInstance;
    this.$scope = $scope;
    this.$filter = $filter;
    this.Session = Session;
    this.all = all;
  }

  $onInit() {
    this.user = this.Session.read('adminUserinfo');
    this.facet = '';
    this.ui = {
      selected: {},
      selectAll: {},
      filtered: {},
    };

    Object.keys(this.all)
      .forEach(type => {
        this.ui.selected[type] = 0;
        if (!this.all[type]) return;

        this.all[type]
          .forEach(x => (this.ui.selected[type] += (x.checked && 1) || 0));
      });

    this.facet = Object.keys(this.all)[0];
    this.ui.filtered = this.all;
  }

  reset() {
    Object.keys(this.all)
      .forEach(type => {
        this.all[type].forEach(x => {
          const item = x;
          this.ui.selectAll[type] = false;
          this.ui.selected[type] = 0;
          return (item.checked = false);
        });
      });

    this.ui.filtered = this.all;
  }

  selectAll(type = 'states') {
    this.ui.selected[type] = 0;
    this.all[type].forEach(i => {
      const item = i;
      item.checked = this.ui.selectAll[type];
      if (item.checked) this.ui.selected[type] += 1;
    });
  }

  changed(status, type = 'states') {
    if (!status) this.ui.selectAll[type] = false;
    this.ui.selected[type] += (status && 1) || -1;
  }

  changedStatus(status, data, type) {
    this.ui.filtered[type].map(x => (
      (data.id === x.id && data.checked === !x.checked)
        ? !x.checked
        : ''));
  }

  apply() {
    this.$uibModalInstance
      .close(Object.keys(this.all)
        .reduce((hash, type) => Object.assign(hash, {
          [type]: (type !== 'ctc')
            ? (this.all[type] && this.all[type]
              .filter(s => s.checked)
              .map(s => (s.id ? Number(s.id) : s.name)))
            : this.all[type].map(s => (s.val ? Number(s.val) : '')),
        }), {}));
  }
}

class PackageFilter {
  /* @ngInject */
  constructor($uibModal) {
    this.$uibModal = $uibModal;
  }

  open({ all = [] }) {
    return this
      .$uibModal
      .open({
        size: 'applicant-state-filter lg',
        windowTopClass: 'bg-black-opacity',
        animation: true,
        templateUrl: 'app/directives/package-filter/package-filter.html',
        controller: 'PackageFilterController',
        controllerAs: '$ctrl',
        resolve: {
          all: () => all,
        },
      })
      .result;
  }
}

angular
  .module('uiGenApp')
  .controller('PackageFilterController', PackageFilterController)
  .service('PackageFilter', PackageFilter);
