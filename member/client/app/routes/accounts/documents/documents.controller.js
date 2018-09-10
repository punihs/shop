class DocumentController {
  /* @ngInject*/
  constructor($http, toaster, Page, Auth) {
    this.$http = $http;
    this.toaster = toaster;
    this.Auth = Auth;
    this.Page = Page;
    this.Page.setTitle('Document  Details - My Account');
    this.$onInit();
  }

  $onInit() {

  }

  create() {

  }
}

angular.module('uiGenApp')
      .controller('DocumentController', DocumentController);
