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
let allPkgData = [];

const summarize = (pkgName, data, first, last) => {
  console.log();
  let span = '';
  if (first && last) {
    span = `(${first}-${last})`;
  }
  console.log(`${pkgName} ${span}`.green);
  bookIds = [...new Set(data.map((item) => item.bookId))];
  console.log('Total Bookings', bookIds.length);
  console.log(
    'Total Users',
    [...new Set(data.map((item) => item.email))].length
  );
};

pkgs.forEach((pkg) => {
  let thisdata = [];
  let thisfolder = logfolder + '/' + pkg + '/';
  let files = readdirSync(thisfolder, { withFileTypes: true })
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name);
  files.forEach((file) => {
    let data = require(thisfolder + file);
    thisdata = thisdata.concat(data);
    allPkgData = allPkgData.concat(data);
  });
  let first = files[0].replace('.json', '');
  let last = files[files.length - 1].replace('.json', '');
  summarize(pkg, thisdata, first, last);
});

summarize('All', allPkgData, '', '');
