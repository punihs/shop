const fs = require('fs');
const hbs = require('handlebars');

const { root } = require('../../../config/environment');

module.exports = ({
  TemplateName, afterContent = [], extras = [],
}) => {
  const [layout, template, groupId] = TemplateName.split('_');
  const layoutBase = `${root}/server/api/${layout}/emails`;
  const layoutHTML = fs.readFileSync(`${layoutBase}/${layout}.hbs`).toString();
  const params = {
    template: fs.readFileSync(`${layoutBase}/${template}/${template}_${groupId}.hbs`).toString(),
  };

  extras.forEach((part) => {
    let piece = part;
    let partPath = `${layoutBase}/${template}/${part}.hbs`;
    if (part.includes(':')) {
      const [type, currentPiece] = part.split(':');
      const path = type === 'global' ? 'partials' : layout;
      piece = currentPiece;
      partPath = `${root}/server/emails/${path}/${currentPiece}.hbs`;
    }

    params[piece] = fs
      .readFileSync(partPath)
      .toString();
  });

  if (afterContent.length) {
    params.afterContent = afterContent
      .map((part) => {
        let partPath = `${layoutBase}/${template}/${part}.hbs`;
        if (part.includes(':')) {
          const [type, piece] = part.split(':');
          const path = type === 'global' ? 'partials' : layout;
          partPath = `${root}/server/emails/${path}/${piece}.hbs`;
        }

        return fs
          .readFileSync(partPath)
          .toString();
      }).join('');
  }

  return hbs.compile(layoutHTML)(params).replace('<!--ad-->', '{{{ad}}}');
};
