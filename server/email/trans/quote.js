const getTemplate = require('../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    email: 'dj@shoppre.com',
    mobile: '9060122213',
    state: 'karnataka',
    city: 'tumakur',
    pin: '572104',
    weiht: '2',
    unit: '1',
    type: 'nondoc',
    length: '',
    scale: '',
    width: '',
    height: '',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Get A Quote',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
