(function () {
  class AdminViewController {
    /* @ngInject */
    constructor($http, $state, $rootScope, Session) {
      this.$http = $http;
      this.$state = $state;
      this.$rootScope = $rootScope;
      this.Session = Session;
      this.$onInit();
    }

    $onInit() {
      this.user = this.Session.read('userinfo');
      this.$http
        .get('/users', { params: { suspend_status: '0,1' } })
        .then(({ data }) => {
          const selectedIds = this.Session.read('VIEW_AS_IDS')
            ? this.Session.read('VIEW_AS_IDS').split(',').map(Number)
            : this.Session.read('VIEW_AS_IDS');
          this.settings.users = data.map(x => Object.assign({
            selected: !selectedIds || selectedIds.includes(x.id),
          }, x));
          this.allSelected(selectedIds, data);
          return !selectedIds && this.onSelect(this.settings.users[0]);
        });
    }

    onSelect(selectedUser) {
      const user = selectedUser;
      const selectedIds = this.settings.users.filter(x => x.selected).map(x => x.id);
      if (!selectedIds.length) {
        this.selectAll = false;
        return (user.selected = true);
      }
      this.Session.create('VIEW_AS_IDS', selectedIds.join(','));
      this
        .$rootScope
        .$broadcast('AdminView', true);
      this.allSelected(selectedIds, this.settings.users);
      return this.$state.reload();
    }

    allSelected(selectedIds, allUsers) {
      this.selectAll = !selectedIds || selectedIds.length === allUsers.length;
    }

    selectAllUsers() {
      this.settings.users.forEach((u) => {
        const user = u;
        user.selected = this.selectAll || this.user.id === user.id;
      });
      this.onSelect(this.settings.users[0]);
    }

    get displayName() {
      if (!(angular.isArray(this.settings.users) && this.settings.users.length)) return '';
      const users = this.settings.users.filter(x => x.selected);
      return [users[0].name, 'All Users', 'Multiple Users'][
      (users.length - 1) &&
      (Number(users.length === this.settings.users.length) || 2)];
    }
  }

  angular
    .module('uiGenApp')
    .directive('adminView', () => ({
      templateUrl: 'components/admin-view/admin-view.html',
      restrict: 'E',
      controller: AdminViewController,
      controllerAs: '$ctrl',
      bindToController: true,
      scope: {
        settings: '='
      },
    }));
})();
