const adobeConf = require('./config/adobe');
const AdobeRepo = require('./repositories/AdobeRepository');
const adobe = new AdobeRepo(adobeConf);
const appConf = require('./config/appConf');
const LicenseGroup = require('./helpers/LicenseGroup');
const lg = new LicenseGroup(appConf);

// let adobeLicenses = lg.getVendorGroupNamesByVendor('Adobe');
// console.log(adobeLicenses);

// let group = adobeLicenses[1];
let group = 'Library API test';

(async () => {
  try {
    let res = await adobe.getGroupMembers(group);
    console.log(res);
  } catch (err) {
    console.error('Unable to do the thing:', err);
  }
})();
