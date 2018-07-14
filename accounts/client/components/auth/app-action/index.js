import angular from 'angular';
import AppActionService from './app-action.service';

export default angular
  .module('shoppreAccounts.appAction', [])
  .service('AppAction', AppActionService)
  .name;
