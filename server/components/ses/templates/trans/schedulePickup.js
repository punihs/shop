const getTemplate = require('../../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    first_name: 'manjesh',
    last_name: 'vinayaka',
    pc_fname: 'Badanehithlu',
    pc_lname: 'Thirthahalli',
    pc_street: 'Thirthahalli',
    pc_city: 'Shimoga',
    pc_state: 'Karnataka',
    pc_pincode: '91',
    dc_fname: '9th cross',
    dc_lname: '5th main',
    dc_street: 'Gokula Ext',
    dc_city: 'Tumakur',
    dc_state: 'Karntaka',
    dc_pincode: '572104',
    mobile: '9060122213',
    size_of_package: '20*50',
    package_items: '10',
    special_items: '1',
    package_weight: '20kg',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Schedule Pickup Request',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
