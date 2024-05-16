const fs = require('fs');
const config = require('./config/appConf');
let software = config.software;
let softwareTitles = software.map((item) => item.libCalName);
// let softwareTitles = ['Adobe Creative Cloud'];

summarizeStats(softwareTitles);

function summarizeStats(softwareTitles) {
  softwareTitles.forEach((softwareTitle) => {
    let folder = softwareTitle.replace(/ /g, '');
    // get all files that aren't directories
    if (fs.existsSync(`./logs/dailyStats/${folder}`) != false) {
      let files = fs.readdirSync(`./logs/dailyStats/${folder}`, {
        withFileTypes: true,
      });
      let anonFiles = fs.readdirSync(`./logs/dailyStats/${folder}/anon`, {
        withFileTypes: true,
      });
      files.push(...anonFiles); // all files, anonymous and not
      files = [...new Set(files)]; // remove duplicates
      files = files.filter((file) => file.isFile()); // remove directories
      files.sort((a, b) => (a.name > b.name ? 1 : -1)); // sort by date
      files.forEach((file) => {
        let date = file.name.split('.')[0];
        getDateStats(softwareTitle, date);
      });
    }
  });
}

function getDateStats(softwareTitle, date) {
  let folder = softwareTitle.replace(/ /g, '');
  let filepath = './logs/dailyStats/' + folder + '/' + date + '.json';
  let anonpath = './logs/dailyStats/' + folder + '/anon/' + date + '.json';
  let data;
  if (fs.existsSync(filepath)) {
    data = require(`./logs/dailyStats/${folder}/${date}.json`);
  } else if (fs.existsSync(anonpath)) {
    data = require(`./logs/dailyStats/${folder}/anon/${date}.json`);
  } else {
    console.log('No file found for ' + softwareTitle + ' on ' + date);
    return;
  }
  let confirmedBookings = data.filter((item) => item.status == 'Confirmed');
  let skipCheckins = confirmedBookings.filter(
    (item) => !item.toDate.match(date + 'T00:00:00')
  );
  let distinctUsers = [...new Set(skipCheckins.map((item) => item.email))];
  let totalUsage = distinctUsers.length;
  console.log(softwareTitle + ',' + date + ',' + totalUsage);
}
