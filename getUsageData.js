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
const { sleep } = require('./helpers/utils');
const path = require('path');
let software = config.software;

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

const genList = (list) => {
  const choices = list.map((item, index) => {
    return {
      key: index,
      name: item.libCalName,
      value: index,
    };
  });
  return {
    type: 'rawlist',
    message: 'Which software to get stats for?',
    name: 'softwareOption',
    choices: choices,
  };
};

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
  const getSoftware = await inquirer.prompt(genList(software));
  const softwareIndex = getSoftware.softwareOption;
  const softwareName = software[softwareIndex].libCalName;
  const folder = softwareName.replace(/ /g, '');
  const cid = software[softwareIndex].libCalCid;
  let date = startDate;

  console.log(startDate, endDate, softwareName, folder, cid);
  while (date <= endDate) {
    await runQuery(date, cid, folder);
    console.log(date);
    date = dayjs(date).add(1, 'day').format('YYYY-MM-DD');
    await timer(1500);
  }
}

main();
