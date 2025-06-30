const dailyStatsService = require('./services/dailyStatsService');
const yargs = require('yargs');
const argv = yargs(process.argv.slice(2)).argv;

const allowedFormats = ['json', 'csv']; // allowed formats
if (argv.format) {
  if (!allowedFormats.includes(argv.format)) {
    console.log('Invalid format. Use json or csv');
    process.exit(1);
  }
  console.log(dailyStatsService(argv.format));
} else {
  console.log(dailyStatsService());
}
