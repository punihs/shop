import angular from 'angular';
import uiRouter from 'angular-ui-router';
import LogoutComponent from './logout.component';
import routing from './logout.routes';

export default angular
  .module('accountsApp.logout', [uiRouter])
  .config(routing)
  .component('logout', LogoutComponent)
  .name;
