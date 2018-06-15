const { root } = require('../config/environment');

const fs = require('fs');
const hbs = require('handlebars');
/* import/no-dynamic-require */
module.exports = ({
  TemplateName, afterContent = [], extras = [],
}) => {
  const [template, layout] = TemplateName.split('_');
  const templateHTML = fs.readFileSync(`${root}/server/email/${template}/${template}.hbs`).toString();
  const params = {
    layout: fs.readFileSync(`${root}/server/email/${template}/${layout}/${layout}.hbs`).toString(),
  };

  extras.forEach((x) => {
    params[x] = fs
      .readFileSync(`${root}/server/email/${template}/${layout}/${x}.hbs`)
      .toString();
  });

  if (afterContent.length) {
    params.afterContent = afterContent
      .map((part) => {
        let partPath = `${root}/server/email/${template}/${layout}/${part}.hbs`;
        if (part.includes(':')) {
          partPath = `${root}/server/email/partials/${part.split(':').pop()}.hbs`;
        }

        return fs
          .readFileSync(partPath)
          .toString();
      }).join('');
  }

  return hbs.compile(templateHTML)(params);
};
