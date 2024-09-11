/*
Use after running `node getUsageData.js`
Retrieves the total bookings and total unique users for the stats collected in the logs/dailyStats folder.
*/
const colors = require('colors');
const StatsSummary = require('./models/StatsSummary');
const statsSummary = new StatsSummary();
statsSummary.summarizeEachPkg();
const data = statsSummary.summaries;

console.log('-----------------------'.blue);
data.forEach((entry) => {
  console.log(`Package: ${entry.pkgName} ${entry.span}`.green);
  console.log(`Total Bookings: ` + `${entry.totalBookings}`.yellow);
  console.log(`Total Users: ` + `${entry.totalUsers}`.yellow);
  console.log('-----------------------'.blue);
});
