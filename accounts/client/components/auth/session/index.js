import angular from 'angular';
import SessionService from './session.service';

export default angular
  .module('shoppreAccounts.session', [])
  .service('Session', SessionService)
  .name;
