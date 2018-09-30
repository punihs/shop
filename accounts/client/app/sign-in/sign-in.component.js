import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './sign-in.routes';

export class SignInController {
  /*  @ngInject */
  constructor($http, $location, $state, Session, $timeout, OAuth, OAuthToken, urls, $stateParams) {
    this.$http = $http;
    this.$location = $location;
    this.$state = $state;
    this.Session = Session;
    this.$timeout = $timeout;
    this.OAuth = OAuth;
    this.OAuthToken = OAuthToken;
    this.$stateParams = $stateParams;
    this.urls = urls;
  }

  $onInit() {
    this.user = { username: '', password: '' };
    if(this.$state.params.code) return this.signin({ form: { $valid: true }, code: this.$state.params.code });
    if(this.OAuth.isAuthenticated() && this.$state.current.name === 'authorise') return this.authorise();

    this.showForm = true;
    this.errors = {};
  }

  authorise() {
    const VALID_APP = {
      1: ['ops'],
      2: ['member'],
    }[this.user.group_id];

    if(!VALID_APP) return (this.error = 'Invalid user group');

    const APP_NAME = VALID_APP[0].toUpperCase();
    const FALLBACK_APP = `${this.urls[`${APP_NAME}_APP`]}`;

    const params = Object.assign({
      response_type: 'code',
      client_id: VALID_APP[0],
      redirect_uri: `${FALLBACK_APP}/access/oauth`,
    }, this.$location.search());
    const url = `${this.urls.API_SERVER}/authorise`;
    return this
      .$http
      .post(url, Object.assign(params, { allow: 'true' }), { params })
      .then(({ data }) => (location.href = data))
      .catch(({ data }) => (this.error = data.error));
  }

  oauthLogin(credentials) {
    return this
      .$http
      .post(`${this.urls.API_SERVER}/oauth/token`, credentials, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        transformRequest(obj) {
          return Object
            .keys(obj)
            .map(p => `${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`)
            .join('&');
        },
        ignoreAuthModule: true,
      });
  }

  signin({ form, code }) {
    this.submitted = true;

    if(form && form.$valid) {
      const { username, password } = this.user;
      this.error = '';
      const options = {};
      return (code
        ? this.oauthLogin({ grant_type: 'google', code })
        : this
          .OAuth
          .getAccessToken({
            username,
            password,
          }, options))
        .then(({ data: oAuthToken }) => {
          this.OAuthToken.setToken(oAuthToken);
          return this.Session
            .update()
            .then(user => {
              this.Session.create('userinfo', user);
              this.user = user;

              return this.authorise();
              //location.href = '/clients';
            });
        })
      .catch(err => {
        this.error = err.data && err.data.error_description || err
          || err.statusText || 'Unexpected error contact Shoppre.com Team';
      });
    }
  }
}

export default angular.module('shoppreAccounts.sign-in', [uiRouter])
  .config(routing)
  .component('signIn', {
    template: require('./sign-in.pug'),
    controller: SignInController
  })
  .name;
