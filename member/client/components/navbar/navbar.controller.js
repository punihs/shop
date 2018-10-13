class NavbarController {
  constructor($rootScope, $http, $state, $timeout, $q, Auth, URLS, Session, Hotkeys) {
    this.$http = $http;
    this.hotkeys = Hotkeys;
    this.$timeout = $timeout;
    this.Auth = Auth;
    this.URLS = URLS;
    this.$state = $state;
    this.$q = $q;
    this.Session = Session;
    this.$rootScope = $rootScope;
    this.$onInit();
  }

  $onInit() {
    this.user = this.Session.read('userinfo');
    if (!this.user) return;
    this.userInitial = this.user.first_name.substr(0, 1);
    this.ui = { count: 0 };
    // Create simple hotkey object
    const hotkey = this.hotkeys.createHotkey({
      key: 'shift+f',
      callback: () => {
        $("#txtSearch").focus();
      },
    });
    // Register the hotkey object
    this.hotkeys.registerHotkey(hotkey);
  }
}

angular.module('uiGenApp')
  .controller('NavbarController', NavbarController);
