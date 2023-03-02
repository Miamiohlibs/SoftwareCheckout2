const fs = require('fs');
const config = require('./config/appConf');
let software = config.software;
let softwareTitles = software.map((item) => item.libCalName);
// let softwareTitles = ['Adobe Creative Cloud'];

summarizeStats(softwareTitles);

function summarizeStats(softwareTitles) {
  softwareTitles.forEach((softwareTitle) => {
    let folder = softwareTitle.replace(/ /g, '');
    let files = fs.readdirSync(`./logs/dailyStats/${folder}`);
    files.forEach((file) => {
      let date = file.split('.')[0];
      getDateStats(softwareTitle, date);
    });
  });
}

function getDateStats(softwareTitle, date) {
  let folder = softwareTitle.replace(/ /g, '');
  let data = require(`./logs/dailyStats/${folder}/${date}.json`);
  let confirmedBookings = data.filter((item) => item.status == 'Confirmed');
  let skipCheckins = confirmedBookings.filter(
    (item) => !item.toDate.match(date + 'T00:00:00')
  );
  let distinctUsers = [...new Set(skipCheckins.map((item) => item.email))];
  let totalUsage = distinctUsers.length;
  console.log(softwareTitle + ',' + date + ',' + totalUsage);
}
