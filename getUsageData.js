// get daily usage data from LibCal Api
// write each day to a file in logs/dailyStats/{folder}
// run this on the command line with:
// node getUsageData.js
// set the date params when prompted and select a software pkg to get stats for
const inquirer = require('inquirer');
const config = require('./config/appConf');
const LibCalApi = require('./models/LibCalApi');
const libCalConf = require('./config/libCal');
const lcapi = new LibCalApi(libCalConf);
const fs = require('fs');
const dayjs = require('dayjs');
// const { sleep } = require('./helpers/utils');
// const path = require('path');
const software = config.software;
const { genList } = require('./helpers/utils');

const timer = (ms) => new Promise((res) => setTimeout(res, ms));

async function runQuery(date, cid, folder) {
  let res = await lcapi.getBookings(cid, date);
  let dir = './logs/dailyStats/' + folder;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, 0744);
  }
  fs.writeFile(
    dir + '/' + date + '.json',
    JSON.stringify(res, null, 2),
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
      //file written successfully
    }
  );
}

async function main() {
  const getStart = await inquirer.prompt({
    type: 'input',
    name: 'startDate',
    message: 'Start date?',
  });
  const getEnd = await inquirer.prompt({
    type: 'input',
    name: 'endDate',
    message: 'End date?',
  });
  const startDate = getStart.startDate;
  const endDate = getEnd.endDate;

  const getSoftware = await inquirer.prompt(
    genList({
      list: software,
      message: 'Which software to get stats for?',
      itemNameProp: 'libCalName',
      itemValueProp: 'libCalCid',
      outputLabel: 'softwareOption',
    })
  );
  console.log('cid: ', getSoftware.softwareOption);
  const cid = getSoftware.softwareOption;
  const softwareName = software.filter((item) => item.libCalCid === cid)[0]
    .libCalName;
  console.log('softwareName: ', softwareName);
  const folder = softwareName.replace(/ /g, '');
  let date = startDate;

  // console.log(startDate, endDate, softwareName, folder, cid);
  while (date <= endDate) {
    await runQuery(date, cid, folder);
    console.log(date);
    date = dayjs(date).add(1, 'day').format('YYYY-MM-DD');
    await timer(1500);
  }
}

main();
