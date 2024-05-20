/*
Use after running `node getUsageData.js`
Retrieves the total bookings and total unique users for the stats collected in the logs/dailyStats folder.
*/
const config = require('./config/appConf');
const { readdirSync } = require('fs');
const path = require('path');
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
  data = data.filter((d) => d.status === 'Confirmed');
  console.log(`${pkgName} ${span}`.green);
  bookIds = [...new Set(data.map((item) => item.bookId))];
  console.log('Total Bookings', bookIds.length);
  console.log(
    'Total Users',
    [...new Set(data.map((item) => item.email))].length
  );
};

function getEarlierDate(dateOne, dateTwo) {
  // Check if dateOne is a valid date string
  const parsedDateOne = dateOne ? new Date(dateOne) : null;

  // Check if dateTwo is a valid date string
  const parsedDateTwo = dateTwo ? new Date(dateTwo) : null;

  // If both are null, return null or an appropriate value
  if (!parsedDateOne && !parsedDateTwo) {
    return null; // or ''
  }

  // If one of them is null, return the other
  if (!parsedDateOne) {
    return dateTwo;
  }
  if (!parsedDateTwo) {
    return dateOne;
  }

  // Compare the two dates and return the smaller one
  return parsedDateOne < parsedDateTwo ? dateOne : dateTwo;
}

function getLaterDate(dateOne, dateTwo) {
  // Check if dateOne is a valid date string
  const parsedDateOne = dateOne ? new Date(dateOne) : null;

  // Check if dateTwo is a valid date string
  const parsedDateTwo = dateTwo ? new Date(dateTwo) : null;

  // If both are null, return null or an appropriate value
  if (!parsedDateOne && !parsedDateTwo) {
    return null; // or ''
  }

  // If one of them is null, return the other
  if (!parsedDateOne) {
    return dateTwo;
  }
  if (!parsedDateTwo) {
    return dateOne;
  }

  // Compare the two dates and return the larger one
  return parsedDateOne > parsedDateTwo ? dateOne : dateTwo;
}

pkgs.forEach((pkg) => {
  let thisdata = [];
  let thisfolder = logfolder + '/' + pkg + '/';
  let files = [];
  let anonFiles = [];

  if (readdirSync(thisfolder, { withFileTypes: true }).length > 0) {
    files = readdirSync(thisfolder, { withFileTypes: true })
      .filter((dirent) => dirent.isFile())
      .map((dirent) => dirent.name);
  }
  // if folder has an anon subfolder, add those files to the data
  let anonFolder = thisfolder + 'anon/';
  if (readdirSync(anonFolder, { withFileTypes: true }).length) {
    anonFiles = readdirSync(anonFolder, { withFileTypes: true })
      .filter((dirent) => dirent.isFile())
      .map((dirent) => dirent.name);
    // files = files.concat(anonFiles);
  }
  files.forEach((file) => {
    let data = require(thisfolder + file);
    thisdata = thisdata.concat(data);
    allPkgData = allPkgData.concat(data);
  });
  anonFiles.forEach((file) => {
    let data = require(anonFolder + file);
    thisdata = thisdata.concat(data);
    allPkgData = allPkgData.concat(data);
  });

  let filesFirst = '';
  let filesLast = '';
  let anonFirst = '';
  let anonLast = '';

  if (files.length) {
    filesFirst = files[0].replace('.json', '');
    filesLast = files[files.length - 1].replace('.json', '');
  }
  if (anonFiles.length) {
    anonFirst = anonFiles[0].replace('.json', '');
    anonLast = anonFiles[anonFiles.length - 1].replace('.json', '');
  }

  let first = getEarlierDate(filesFirst, anonFirst);
  let last = getLaterDate(filesLast, anonLast);
  summarize(pkg, thisdata, first, last);
});

// summarize('All', allPkgData, '', '');
