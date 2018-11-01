const crypto = require('crypto');
const debug = require('debug');
const util = require('util');

const log = debug('s.crypt');
const iv = '@@@@&&&&####$$$$';
const crypt = {
  encrypt(data, customKey) {
    // const iv = this.iv;
    const key = customKey;
    let algo = '256';

    // eslint-disable-next-line default-case
    switch (key.length) {
      case 16:
        algo = '128';
        break;
      case 24:
        algo = '192';
        break;
      case 32:
        algo = '256';
        break;
    }
    const cipher = crypto.createCipheriv(`AES-${algo}-CBC`, key, iv);

    let encrypted = cipher.update(data, 'binary', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  },

  decrypt(data, customKey) {
    // const { iv } = this.iv;
    const key = customKey;
    let algo = '256';

    // eslint-disable-next-line default-case
    switch (key.length) {
      case 16:
        algo = '128';
        break;
      case 24:
        algo = '192';
        break;
      case 32:
        algo = '256';
        break;
    }
    const decipher = crypto.createDecipheriv(`AES-${algo}-CBC`, key, iv);
    let decrypted = decipher.update(data, 'base64', 'binary');
    try {
      decrypted += decipher.final('binary');
    } catch (e) {
      util.log(util.inspect(e));
    }
    return decrypted;
  },
  // eslint-disable-next-line default-case
  gen_salt(length, cb) {
    crypto.randomBytes((length * 3.0) / 4.0, (err, buf) => {
      let salt;
      if (!err) {
        salt = buf.toString('base64');
      }
      cb(err, salt);
    });
  },

  /* one way md5 hash with salt */
  md5sum(salt, data) {
    return crypto.createHash('md5').update(salt + data).digest('hex');
  },
  sha256sum(salt, data) {
    return crypto.createHash('sha256').update(data + salt).digest('hex');
  },
};

module.exports = crypt;

(function x() {
  let i;

  function logsalt(err, salt) {
    if (!err) {
      log('salt is ', salt);
    }
  }

  if (require.main === module) {
    const enc = crypt.encrypt('One97');
    log('encrypted - ', enc);
    log('decrypted - ', crypt.decrypt(enc));
    // eslint-disable-next-line no-plusplus
    for (i = 0; i < 5; i++) {
      crypt.gen_salt(4, logsalt);
    }
  }
}());
