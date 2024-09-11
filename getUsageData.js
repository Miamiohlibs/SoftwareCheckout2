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
const yargs = require('yargs');
const argv = yargs(process.argv.slice(2)).argv;
const chrono = require('chrono-node');
const { asyncForEach } = require('./helpers/utils');
// const { sleep } = require('./helpers/utils');
// const path = require('path');
const software = config.software;
const { genList } = require('./helpers/utils');
const e = require('express');

const timer = (ms) => new Promise((res) => setTimeout(res, ms));

function help() {
  console.log('Usage: node getUsageData.js');
  console.log('Options:');
  console.log(
    '  --startDate=YYYY-MM-DD (also supports dates like "two weeks ago" or "yesterday")'
  );
  console.log('  --endDate=YYYY-MM-DD (or other date format)');
  console.log('  --libCalCid=libCalCid or "all"');
  console.log('  --help');
}

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

async function getStats(startDate, endDate, cid, softwareName) {
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

async function main() {
  let startDate, endDate, cid;
  // console.log('argv: ', argv);
  if (argv.h === true) {
    help();
    return;
  } else {
    console.log('For help, run with -h');
  }
  if (argv.startDate && argv.endDate && argv.libCalCid) {
    startDate = argv.startDate;
    endDate = argv.endDate;
    cid = argv.libCalCid.toString();
  } else {
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
    startDate = getStart.startDate;
    endDate = getEnd.endDate;

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
    cid = getSoftware.softwareOption;
  }

  startDate = dayjs(chrono.parseDate(startDate)).format('YYYY-MM-DD');
  endDate = dayjs(chrono.parseDate(endDate)).format('YYYY-MM-DD');

  if (cid == 'all') {
    let activeSoftware = software.filter((item) => item.active === true);
    asyncForEach(activeSoftware, async (item) => {
      await getStats(startDate, endDate, item.libCalCid, item.libCalName);
    });
    // activeSoftware.forEach(async (item) => {
    //   await getStats(startDate, endDate, item.libCalCid, item.libCalName);
    // });
    return;
  } else {
    const softwareName = software.filter((item) => item.libCalCid === cid)[0]
      .libCalName;
    await getStats(startDate, endDate, cid, softwareName);
  }
}

main();
