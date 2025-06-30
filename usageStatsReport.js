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
  console.log(`Package: ${entry.pkgName}`.green);
  console.log(
    `Dates: ` + `${entry.first}`.yellow + ` - ` + `${entry.last}`.yellow
  );
  console.log(`Total Bookings: ` + `${entry.totalBookings}`.yellow);
  console.log(`Distinct Users: ` + `${entry.distinctUsers}`.yellow);
  console.log('-----------------------'.blue);
});
