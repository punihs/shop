import angular from 'angular';
import moment from 'moment';

const { host, protocol } = window.location;
const PREFIX = `${protocol}//${host.substr(0, host.indexOf('-') + 1)}`;
let DOMAIN = `${host.substr(host.indexOf('.') + 1)}`;

const IS_DEV = DOMAIN.includes(':');
DOMAIN = IS_DEV ? 'shoppre.test' : DOMAIN;
const API_SERVER = IS_DEV ? 'http://localhost:5000' : `${PREFIX}api.${DOMAIN}`;

const S_API_SERVER = 'https://secure.shoppre.com';
const OAUTH = 'oauth';
const SSL = (protocol === 'https');
const S_OPS_URL = `${PREFIX}ops.${DOMAIN}`;
const DEFAULT_REDIRECT = `${PREFIX}member.${DOMAIN}/access/oauth`;
const OPS_APP = `${PREFIX}ops.${DOMAIN}`;
const MEMBER_APP = `${PREFIX}member.${DOMAIN}`;

const constants = angular
  .module('shoppreAccounts.constants', [])
  .constant('moment', moment)
  .constant('urls', {
    PREFIX,
    DOMAIN,
    API_SERVER,
    S_API_SERVER,
    OAUTH,
    SSL,
    DEFAULT_REDIRECT,
    S_OPS_URL,
    OPS_APP,
    MEMBER_APP,
  });
export default constants.name;
