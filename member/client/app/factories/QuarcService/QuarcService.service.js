'use strict';

(function() {
  class QuarcService {
    /* @ngInject */
    constructor(Page, Session, User, URLS) {
      this.Page = Page;
      this.Session = Session;
      this.User = User;
      this.URLS = URLS;
    }

    banner = (type, body, title, toasterId = 1, onHideCallback = () => {}) => {
      return {
        type,
        title,
        body,
        toasterId,
        onHideCallback
      };
    };

    toast = (type, body, title, toasterId = 2, timeout = 5000, onHideCallback = () => {}) => {
      return {
        type,
        title,
        body,
        toasterId,
        timeout,
        onHideCallback
      };
    }
  }

  angular
    .module('uiGenApp')
    .service('QuarcService', QuarcService);
}());

