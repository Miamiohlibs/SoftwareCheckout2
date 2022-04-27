const config = require('./config/appConf');
const { readdirSync } = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const colors = require('colors');
// let software = config.software;

// get list of folders in logs/dailyStats - each is one set of stats
const getDirectories = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

let logfolder = path.resolve(__dirname, './logs/dailyStats/');
let pkgs = getDirectories(logfolder);

pkgs.forEach((pkg) => {
  let thisdata = [];
  let thisfolder = logfolder + '/' + pkg + '/';
  let files = readdirSync(thisfolder, { withFileTypes: true })
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name);
  files.forEach((file) => {
    let data = require(thisfolder + file);
    thisdata = thisdata.concat(data);
  });
  let first = files[0].replace('.json', '');
  let last = files[files.length - 1].replace('.json', '');
  console.log();
  console.log(`${pkg} (${first}-${last})`.green);
  bookIds = [...new Set(thisdata.map((item) => item.bookId))];
  console.log('Total Bookings', bookIds.length);
  console.log(
    'Total Users',
    [...new Set(thisdata.map((item) => item.email))].length
  );
});
