const express = require('express');
const router = express.Router();
const { text } = require('express');
const appConf = require('../../config/appConf');
const LicenseGroup = require('../../helpers/LicenseGroup');
const lg = new LicenseGroup(appConf);
const {
  filterToEntriesMissingFromSecondArray,
} = require('../../helpers/utils');
const baseUrl = 'http://localhost:3010';

async function getAdobeBookingsByGroup(group) {
  const adobeConf = require('../../config/adobe');
  const AdobeRepository = require('../../repositories/AdobeRepository');
  const adobe = new AdobeRepository(adobeConf);
  let bookings = await adobe.getGroupMembers(group);
  return bookings;
}

async function getLibCalBookingsByCid(cid) {
  const libcalConf = require('../../config/libcal');
  const LibCalRepository = require('../../repositories/LibCalRepository');
  const libcal = new LibCalRepository(libcalConf);
  let bookings = await libcal.getCurrentValidBookings(cid);
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
  const libcalConf = require('../../config/libcal');
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
  const adobeBookings = await getAdobeBookingsByGroup(group);
  const adobeEmails = adobeBookings.map((i) => i.email);
  const libCalBookings = await getLibCalBookingsByCid(cid);
  const libCalEmails = libCalBookings.map((i) => i.email);
  let emailsToRemove = filterToEntriesMissingFromSecondArray(
    adobeEmails,
    libCalEmails
  );
  let emailsToAdd = filterToEntriesMissingFromSecondArray(
    libCalEmails,
    adobeEmails
  );
  res.json({
    emailsToRemove: emailsToRemove,
    emailsToAdd: emailsToAdd,
    adobeEmails: adobeEmails,
    libCalEmails: libCalEmails,
  });

  // get unique emails from libcalList
});

router.get('/jamf', async (req, res) => {
  let jamfBookings = await getJamfBookingsByGroupId(req.query.group);
  res.json(jamfBookings);
});

router.get('/jamf/compare', async (req, res) => {
  let jamfEmails = await getJamfBookingsByGroupId(req.query.group);
  const libCalBookings = await getLibCalBookingsByCid(req.query.cid);
  const libCalEmails = libCalBookings.map((i) => i.email);
  let emailsToRemove = filterToEntriesMissingFromSecondArray(
    jamfEmails,
    libCalEmails
  );
  let emailsToAdd = filterToEntriesMissingFromSecondArray(
    libCalEmails,
    jamfEmails
  );
  res.json({
    emailsToRemove: emailsToRemove,
    emailsToAdd: emailsToAdd,
    adobeEmails: jamfEmails,
    libCalEmails: libCalEmails,
  });
});

module.exports = router;
