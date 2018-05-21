const getTemplate = require('../../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    first_name: 'Meena',
    order_id: 'Pack12345',
    seller: 'FB seller',
    received_date: '21/05/2018',
    weight: '10',
  },
  Template: {
    TemplateName,
    SubjectPart: 'You have Requested to Return a Package ',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
