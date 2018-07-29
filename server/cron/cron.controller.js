const schedule = require('node-schedule');
const shipmate = require('../api/shipment/shipment.controller');

const { log } = console;

exports.index = (req, res) => {
  log('setting up cron');
  // schedule.scheduleJob('*/20 * * * * *', () => );
  shipmate.updateShipmetStatus();
  const shipmateStatus = schedule;
  res.json({ shipmateStatus });
};

