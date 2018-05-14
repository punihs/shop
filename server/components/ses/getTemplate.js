const { root } = require('../../config/environment');

const fs = require('fs');
const hbs = require('handlebars');
/* import/no-dynamic-require */
module.exports = ({
  layoutName, TemplateName, afterContent = [], extras = [],
}) => {
  const layout = fs.readFileSync(`${root}/server/components/hbs/templates/${layoutName}.hbs`).toString();
  const params = {
    content: fs.readFileSync(`${root}/server/components/ses/content/${TemplateName}.hbs`).toString(),
  };

  extras.forEach((x) => {
    params[x] = fs
      .readFileSync(`${root}/server/components/ses/content/${x}.hbs`)
      .toString();
  });

  if (afterContent.length) {
    params.afterContent = afterContent
      .map(x => fs
        .readFileSync(`${root}/server/components/ses/content/${x}.hbs`)
        .toString()).join('');
  }

  return hbs.compile(layout)(params);
};
