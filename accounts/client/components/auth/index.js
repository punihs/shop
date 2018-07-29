import angular from 'angular';
import 'angular-http-auth';
import Session from './session';
import AUTH_EVENTS from './auth.constant';
import UrlInterceptor from './url.interceptor';
import authRun from './auth.run';
import authConfig from './auth.config';
import urls from '../../app/app.constants';
import AppAction from './app-action';

export default angular
  .module('shoppreAccounts.auth', [Session, AppAction, 'http-auth-interceptor', urls])
  .constant('AUTH_EVENTS', AUTH_EVENTS)
  .factory('UrlInterceptor', UrlInterceptor)
  .run(authRun)
  .config(authConfig)
  .name;
