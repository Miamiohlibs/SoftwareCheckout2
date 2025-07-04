const dayjs = require('dayjs');
const humanizeDuration = require('humanize-duration');
const express = require('express');
const router = express.Router();
const appConf = require('../../config/appConf');
const LicenseGroup = require('../../helpers/LicenseGroup');
const lg = new LicenseGroup(appConf);
const LogQuerier = require('../../models/LogQuerier');
const emailConverterService = require('../../services/emailConverterService');
const {
  filterToEntriesMissingFromSecondArray,
} = require('../../helpers/utils');
const path = require('path');
const fs = require('fs');
const { Parser } = require('json2csv');
const libCal = require('../../config/libCal');

async function getAdobeBookingsByGroup(group) {
  const adobeConf = require('../../config/adobe');
  const AdobeRepository = require('../../repositories/AdobeRepository');
  const adobe = new AdobeRepository(adobeConf);
  let bookings = await adobe.getGroupMembers(group);
  return bookings;
}

async function getLibCalBookingsByCid(cid) {
  const libCalConf = require('../../config/libCal');
  const LibCalRepository = require('../../repositories/LibCalRepository');
  const libcal = new LibCalRepository(libCalConf);
  let bookings = await libcal.getCurrentValidBookings(cid);
  // calculate time waiting for license assignment, add it to the object
  bookings = bookings.map((i) => {
    let waitTimeStarted;
    // calculate wait time started based on when the request was created
    // unless it was created in advance of the fromDate, in which case
    // use the fromDate as the start of the wait time (they start waiting
    // once the reservation starts, not when they request it)
    if (i.hasOwnProperty('created') && i.hasOwnProperty('fromDate')) {
      if (i.fromDate > i.created) {
        waitTimeStarted = i.fromDate;
      } else {
        waitTimeStarted = i.created;
      }
    } else if (i.hasOwnProperty('created')) {
      waitTimeStarted = i.created;
    } else if (i.hasOwnProperty('fromDate')) {
      waitTimeStarted = i.fromDate;
    } else {
      waitTimeStarted = null;
    }

    i.timeWaiting = waitTimeStarted
      ? humanizeDuration(
          dayjs().diff(dayjs(waitTimeStarted), 'seconds') * 1000,
          {
            units: ['d', 'h', 'm', 's'],
          }
        )
      : null;
    return i;
  });
  return bookings;
}

async function getJamfBookingsByGroupId(group) {
  const jamfConf = require('../../config/jamf');
  const JamfRepository = require('../../repositories/JamfRepository');
  const jamf = new JamfRepository(jamfConf);
  let bookings = await jamf.getGroupMembers(group);
  return bookings;
}

router.get('/vendors', async (req, res) => {
  //   res.json({ text: 'Hello World!' });
  let vendors = await lg.getActiveVendors();
  res.json(vendors);
});

router.get('/libcal', async (req, res) => {
  const libcalConf = require('../../config/libCal');
  const LibCalRepository = require('../../repositories/LibCalRepository');
  const libcal = new LibCalRepository(libcalConf);
  let group = req.query.group;
  let bookings = await libcal.getCurrentValidBookings(group);
  if (req.query.hasOwnProperty('emailOnly')) {
    let emailOnly = req.query.emailOnly;
    if (emailOnly === 'true') {
      let emails = libcal.getUniqueEmailsFromBookings(bookings);
      res.json(emails);
      return;
    }
  }
  res.json(bookings);
});

router.get('/libcal/future/:cid', async (req, res) => {
  const libCalConf = require('../../config/libCal');
  const LibCalRepository = require('../../repositories/LibCalRepository');
  const libcal = new LibCalRepository(libCalConf);
  let futureBookings = await libcal.getValidFutureBookings(req.params.cid);
  res.json(futureBookings);
});

router.get('/groups', async (req, res) => {
  let vendor = req.query.vendor;
  let vendors = lg.getActiveVendors();
  let returnObj = [];
  for (let i = 0; i < vendors.length; i++) {
    let vendor = vendors[i];
    let groups = lg.getLicenseGroupsByVendor(vendor);
    returnObj.push({ vendor: vendor, groups: groups });
  }
  //   let groups = await lg.getVendorGroups(vendor);
  res.json(returnObj);
});

router.get('/adobe', async (req, res) => {
  const bookings = await getAdobeBookingsByGroup(req.query.group);
  res.json(bookings);
});

router.get('/adobe/compare', async (req, res) => {
  let group = req.query.group;
  let cid = req.query.cid;
  // check to see that group/cid/vendor are in config
  let matchingGroup = appConf.software.filter(
    (i) =>
      parseInt(i.vendorGroupId) === parseInt(group) &&
      parseInt(i.libCalCid) === parseInt(cid) &&
      i.vendor === 'Adobe'
  );
  if (matchingGroup.length != 1) {
    res.status(404).send({ error: 'Vendor/Group/CID not found in config' });
    return;
  }
  const adobeBookings = await getAdobeBookingsByGroup(group);
  const adobeEmails = adobeBookings.map((i) => i.email);
  const libCalBookings = await getLibCalBookingsByCid(cid);

  let libCalEmails = libCalBookings.map((i) => i.email);
  libCalEmails = await emailConverterService(libCalEmails);
  let emailsToRemove = filterToEntriesMissingFromSecondArray(
    adobeEmails,
    libCalEmails
  );
  let emailsToAdd = filterToEntriesMissingFromSecondArray(
    libCalEmails,
    adobeEmails
  );
  adobeEmails.sort();
  libCalEmails.sort();
  bookingsToAdd = libCalBookings.filter((i) => emailsToAdd.includes(i.email));
  res.json({
    emailsToRemove: emailsToRemove,
    bookingsToAdd: bookingsToAdd,
    vendorEmails: adobeEmails,
    libCalEmails: libCalEmails,
  });

  // get unique emails from libcalList
});

router.get('/jamf', async (req, res) => {
  let jamfBookings = await getJamfBookingsByGroupId(req.query.group);
  res.json(jamfBookings);
});

router.get('/jamf/compare', async (req, res) => {
  let group = req.query.group;
  let cid = req.query.cid;
  let matchingGroup = appConf.software.filter(
    (i) =>
      parseInt(i.vendorGroupId) === parseInt(group) &&
      parseInt(i.libCalCid) === parseInt(cid) &&
      i.vendor === 'Jamf'
  );
  console.log(matchingGroup);
  if (matchingGroup.length != 1) {
    res
      .status(404)
      .send({ error: 'Vendor, Group, or CID not found in config' });
    return;
  }
  let jamfEmails = await getJamfBookingsByGroupId(req.query.group);
  const libCalBookings = await getLibCalBookingsByCid(req.query.cid);
  let libCalEmails = libCalBookings.map((i) => i.email);
  libCalEmails = await emailConverterService(libCalEmails);
  let emailsToRemove = filterToEntriesMissingFromSecondArray(
    jamfEmails,
    libCalEmails
  );
  let emailsToAdd = filterToEntriesMissingFromSecondArray(
    libCalEmails,
    jamfEmails
  );
  libCalEmails.sort();
  jamfEmails.sort();
  bookingsToAdd = libCalBookings.filter((i) => emailsToAdd.includes(i.email));
  res.json({
    emailsToRemove: emailsToRemove,
    bookingsToAdd: bookingsToAdd,
    vendorEmails: jamfEmails,
    libCalEmails: libCalEmails,
  });
});

router.get('/logs', async (req, res) => {
  const logQuerier = new LogQuerier();
  let logs = logQuerier.getLogDates();
  res.json(logs);
});

router.get('/logs/examine/:file/:uid', async (req, res) => {
  const logQuerier = new LogQuerier();
  let logs = logQuerier.readLogFile(req.params.file);
  if (logs === false) {
    res.status(404).send('File not found');
  } else {
    let entries = await logQuerier.selectEntriesByField(
      logs,
      'uid',
      req.params.uid
    );
    res.json(entries);
  }
});

router.get('/logs/uids/:file', async (req, res) => {
  const logQuerier = new LogQuerier();
  let logs = logQuerier.readLogFile(req.params.file);
  if (logs === false) {
    res.status(404).send({ error: 'File not found' });
  } else {
    let uids = await logQuerier.getFirstEntryByUid(logs);
    res.json(uids);
  }
});

// Unused?
// router.get('/logs/show/:date', async (req, res) => {
//   const logQuerier = new LogQuerier();
//   let log = logQuerier.readLogFile(req.params.date);
//   res.json(log);
// });

router.get('/stats/daily', (req, res) => {
  const dailyStatsService = require('../../services/dailyStatsService');
  let format = 'csv';
  if (req.query.format) {
    format = req.query.format;
  }
  const data = dailyStatsService(format);
  if (format === 'json') {
    res.json(data);
  } else if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=dailyStats.csv');
    res.send(data);
  }
});

router.get('/stats/summary', async (req, res) => {
  let format = 'csv';
  if (req.query.format) {
    format = req.query.format;
  }
  const StatsSummary = require('../../services/summaryStatsService');
  const reportStartDate = req.query.reportStartDate || '';
  const reportEndDate = req.query.reportEndDate || '';
  const data = StatsSummary(format, reportStartDate, reportEndDate);

  if (format === 'json') {
    res.json(data);
  } else if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=dailyStats.csv');
    res.send(data);
  }
});

router.get('/stats/eachCheckout', async (req, res) => {
  let folder = 'logs/eachCheckout';
  let files = fs.readdirSync(path.join(__dirname, '../../', folder));
  let fileInfo = files.map((file) => {
    let filepath = path.join(__dirname, '../../', folder, file);
    // let filepath = path.resolve(this.logDir + '/' + file);
    let stats = fs.statSync(filepath);
    if (stats.size <= 2) {
      return; // even an empty file will be 2 bytes: []
    }
    return { filename: file, fileSizeinBytes: Math.round(stats.size / 1024) };
  });
  fileInfo = fileInfo.filter((i) => i !== undefined);
  // res.json(files);
  res.json(fileInfo);
});

router.get('/stats/eachCheckout/:file', async (req, res) => {
  let folder = 'logs/eachCheckout';
  let file = req.params.file;
  try {
    let filepath = path.join(__dirname, '../../', folder, file);
    let data = fs.readFileSync(filepath, 'utf8');
    const json = JSON.parse(data);

    if (req.query.format === 'json') {
      res.send(json); // json
    } else {
      //csv

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=eachCheckout.csv'
      );
      const parser = new Parser({});
      const csv = parser.parse(json);
      res.send(csv);
    }
  } catch (err) {
    res.status(500).send({ status: 500, message: err.message });
  }
});

router.get('/stats/adobeSavings', async (req, res) => {
  let adobeConf = require('../../config/adobe');
  let savingsConf = adobeConf.savingsCalculator;
  let AdobeSavingsCalculator = require('../../models/AdobeSavingsCalculator');
  let calc = new AdobeSavingsCalculator(savingsConf);
  calc.calculateSavings();

  let firstMonth = calc.monthlySavings[0].month;
  let lastMonth = calc.monthlySavings[calc.monthlySavings.length - 1].month;

  let output = {
    conf: calc.conf,
    firstMonth: firstMonth,
    lastMonth: lastMonth,
    users: calc.users.length,
    monthlySavings: calc.monthlySavings,
    totalSavings: calc.totalSavings,
  };
  res.json(output);
});
module.exports = router;
