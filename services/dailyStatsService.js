const config = require('../config/appConf');
let software = config.software;
let softwareTitles = software.map((item) => item.libCalName);
const { Parser } = require('json2csv');
const StatsSummary = require('../models/DailyStatsSummary');

module.exports = (format = 'csv') => {
  const summary = new StatsSummary();
  let json = summary.summarizeStats(softwareTitles);
  if (format == 'json') {
    return json;
  }
  const parser = new Parser();
  const csv = parser.parse(json);
  return csv;
};
