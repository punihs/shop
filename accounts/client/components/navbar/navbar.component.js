'use strict';
/* eslint no-sync: 0 */

import angular from 'angular';

export class NavbarComponent {
  menu = [{
    title: 'Home',
    state: 'dashboard'
  },
  {
    title: 'Sign In',
    state: 'sign-in'
  }];
  isCollapsed = true;

  /*  @ngInject   */
  constructor(Session, $state) {
    this.Session = Session;
    this.$state = $state;
    this.user = Session.read('userinfo');
  }

  logOut() {
    this.Session.destroy();
    location.href = '/sign-in';
  }
}

export default angular.module('directives.navbar', [])
  .component('navbar', {
    template: require('./navbar.pug'),
    controller: NavbarComponent
  })
  .name;
