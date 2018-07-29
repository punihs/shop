'use strict';

import angular from 'angular';
// import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';

import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';
import 'angular-oauth2';

import {
  routeConfig
} from './app.config';

import FourOFour from './four-o-four';
import Logout from './logout';

import Auth from '../components/auth';
import navbar from '../components/navbar/navbar.component';

import footer from '../components/footer/footer.component';
import signIn from './sign-in/sign-in.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import updateTitle from '../components/update-title/update-title.directive';

import './app.scss';
angular.module('shoppreAccounts', [
  FourOFour, ngCookies, ngResource, ngSanitize, uiRouter, uiBootstrap, 'angular-oauth2',
  Auth, navbar, footer, constants, util, signIn, Logout,
  //directives and components
  updateTitle,
])
  .config(routeConfig);

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['shoppreAccounts'], {
      strictDi: true
    });
  });
