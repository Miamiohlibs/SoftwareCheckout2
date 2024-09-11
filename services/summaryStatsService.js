const { Parser } = require('json2csv');
const StatsSummary = require('../models/StatsSummary');

module.exports = (format = 'csv') => {
  const statsSummary = new StatsSummary();
  statsSummary.summarizeEachPkg();
  const json = statsSummary.summaries;
  if (format == 'json') {
    return json;
  }
  const parser = new Parser();
  const csv = parser.parse(json);
  return csv;
};
