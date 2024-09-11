const { Parser } = require('json2csv');
const StatsSummary = require('../models/StatsSummary');
const statsSummary = new StatsSummary();

module.exports = (format = 'csv') => {
  statsSummary.summarizeEachPkg();
  const json = statsSummary.summaries;
  if (format == 'json') {
    return json;
  }
  const parser = new Parser();
  const csv = parser.parse(json);
  return csv;
};
