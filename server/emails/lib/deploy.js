const fs = require('fs');

const build = require('./build');
const updateSend = require('./update-send');
const { root } = require('../../config/environment');

exports.cmd = () => Promise
  .all([
    'package',
  ].map(layout => Promise
    .all(fs.readdirSync(`${root}/server/api/${layout}/emails`)
      .map((template) => {
        if (template.includes('.')) return Promise.resolve();

        return build.cmd(`${layout}_${template}`)
          .then(() => updateSend.cmd(`${layout}_${template}`))
          .catch(() => updateSend.cmd(`${layout}_${template}`));
      }))));
