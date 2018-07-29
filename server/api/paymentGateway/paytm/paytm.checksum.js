
const crypt = require('./crypt');
const util = require('util');
const crypto = require('crypto');
const debug = require('debug');

const log = debug('s.paytm.checksum');
// mandatory flag: when it set, only mandatory parameters are added to checksum

exports.paramsToString = (parameters, mandatoryflag) => {
  let data = '';
  const params = parameters;
  const tempKeys = Object.keys(params);
  tempKeys.sort();
  tempKeys.forEach((key) => {
    const n = params[key].toString().includes('REFUND');
    const m = params[key].toString().includes('|');
    if (n === true) {
      params[key] = '';
    }
    if (m === true) {
      params[key] = '';
    }
    if (key !== 'CHECKSUMHASH') {
      if (params[key] === 'null') params[key] = '';
      // eslint-disable-next-line no-undef
      if (!mandatoryflag || mandatoryParams.indexOf(key) !== -1) {
        data += (`${params[key]} |`);
      }
    }
  });
  return data;
};

exports.genchecksum = (parameters, key, cb) => {
  const params = parameters;
  const data = this.paramsToString(params);

  crypt.gen_salt(4, (err, salt) => {
    const sha256 = crypto.createHash('sha256').update(data + salt).digest('hex');
    const checkSum = sha256 + salt;
    log('key', key);
    log('checkSum', checkSum);
    const encrypted = crypt.encrypt(checkSum, key);
    params.CHECKSUMHASH = encrypted;
    cb(undefined, params);
  });
};

exports.genchecksumbystring = (params, key, cb) => {
  crypt.gen_salt(4, (err, salt) => {
    const sha256 = crypto.createHash('sha256').update(`${params}  | ${salt}`).digest('hex');
    const checkSum = sha256 + salt;
    const encrypted = crypt.encrypt(checkSum, key);

    let CHECKSUMHASH = encodeURIComponent(encrypted);
    CHECKSUMHASH = encrypted;
    cb(undefined, CHECKSUMHASH);
  });
};

exports.verifychecksum = (parameters, key) => {
  const params = parameters;

  const data = this.paramsToString(params, false);

  // TODO: after PG fix on thier side remove below two lines
  if (params.CHECKSUMHASH) {
    params.CHECKSUMHASH = params.CHECKSUMHASH.replace('\n', '');
    params.CHECKSUMHASH = params.CHECKSUMHASH.replace('\r', '');

    const temp = decodeURIComponent(params.CHECKSUMHASH);
    const checksum = crypt.decrypt(temp, key);
    const salt = checksum.substr(checksum.length - 4);
    const sha256 = checksum.substr(0, checksum.length - 4);
    const hash = crypto.createHash('sha256').update(data + salt).digest('hex');

    if (hash === sha256) {
      return true;
    }
    util.log('checksum is wrong');
    return false;
  }
  util.log('checksum not found');
  return false;
};

exports.verifychecksumbystring = (params, key, checksumhash) => {
  const checksum = crypt.decrypt(checksumhash, key);
  const salt = checksum.substr(checksum.length - 4);
  const sha256 = checksum.substr(0, checksum.length - 4);
  const hash = crypto.createHash('sha256').update(`${params}|${salt}`).digest('hex');
  if (hash === sha256) {
    return true;
  }
  util.log('checksum is wrong');
  return false;
};

exports.genchecksumforrefund = (parameters, key, cb) => {
  const params = parameters;

  const data = this.paramsToStringrefund(params);

  crypt.gen_salt(4, (err, salt) => {
    const sha256 = crypto.createHash('sha256').update(data + salt).digest('hex');
    const checkSum = sha256 + salt;
    const encrypted = crypt.encrypt(checkSum, key);
    params.CHECKSUM = encodeURIComponent(encrypted);
    cb(undefined, params);
  });
};

exports.paramsToStringrefund = (parameters, mandatoryflag) => {
  const params = parameters;
  let data = '';
  const tempKeys = Object.keys(params);
  tempKeys.sort();

  tempKeys.forEach((key) => {
    const m = params[key].includes('|');

    if (m === true) {
      params[key] = '';
    }
    if (key !== 'CHECKSUMHASH') {
      if (params[key] === 'null') params[key] = '';
      // eslint-disable-next-line no-undef
      if (!mandatoryflag || mandatoryParams.indexOf(key) !== -1) {
        data += (`${params[key]} |`);
      }
    }
  });
  return data;
};

