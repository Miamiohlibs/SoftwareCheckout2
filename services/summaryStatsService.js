const { Parser } = require('json2csv');
const StatsSummary = require('../models/StatsSummary');
const { report } = require('process');

module.exports = (format = 'csv', reportStartDate = '', reportEndDate = '') => {
  const statsSummary = new StatsSummary();
  statsSummary.summarizeEachPkg(reportStartDate, reportEndDate);
  const json = statsSummary.summaries;
  if (json.length == 0) {
    throw new Error('No data found');
  }
  if (format == 'json') {
    return json;
  }
  const parser = new Parser();
  const csv = parser.parse(json);
  return csv;
};
