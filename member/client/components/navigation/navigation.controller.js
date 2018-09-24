class NavigationController {
  constructor(URLS) {
    this.URLS = URLS;
  }
}

angular.module('uiGenApp')
  .controller('NavigationController', NavigationController);
