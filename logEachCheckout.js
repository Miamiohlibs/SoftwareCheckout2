/*
  goes through all the logs in logs/dailyStats and creates a new log in 
  logs/eachCheckout that lists each checkout just once, and contains no 
  personal identifying information
*/
const { readdirSync } = require('fs');
const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');

// get list of folders in logs/dailyStats - each is one set of stats
const getDirectories = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

let logfolder = path.resolve(__dirname, './logs/dailyStats/');
let pkgs = getDirectories(logfolder);
let allPkgData = [];

const logCheckoutDates = function (data, filename) {
  let allBookings = [];
  data = data.filter((d) => d.status === 'Confirmed');
  bookIds = [...new Set(data.map((item) => item.bookId))];
  bookIds.forEach((currBookId) => {
    // get first entry only for each checkout
    let { bookId, cid, fromDate, category_name, item_name } = data.find(
      (item) => item.bookId === currBookId
    );
    // gather relevant data to log
    fromDate = dayjs(fromDate).format('YYYY-MM-DD');
    allBookings.push({
      bookId,
      cid,
      fromDate,
      category_name,
      item_name,
    });
  });
  allBookings.sort((a, b) => (a.fromDate > b.fromDate ? 1 : -1));
  let dir = './logs/eachCheckout/';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, 0744);
  }
  fs.writeFile(
    dir + '/' + filename + '.json',
    JSON.stringify(allBookings, null, 2),
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
      //file written successfully
    }
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
  logCheckoutDates(thisdata, pkg);
});

logCheckoutDates(allPkgData, 'all');
