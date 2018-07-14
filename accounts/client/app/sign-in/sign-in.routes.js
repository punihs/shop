'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('sign-in', {
    url: '/sign-in?token&code',
    template: '<sign-in></sign-in>',
    data: 'Login | S',
  }).state('authorise', {
    url: '/authorise',
    template: '<sign-in></sign-in>',
    data: 'Login | S',
  });
}
