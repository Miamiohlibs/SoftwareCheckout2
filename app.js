const appConf = require('./config/appConf');
const LicenseGroup = require('./helpers/LicenseGroup');
const lg = new LicenseGroup(appConf);
const adobe = require('./services/AdobeService');

let vendors = lg.getActiveVendors();

if (vendors.includes('Adobe')) {
  adobe();
}

if (vendors.includes('Jamf')) {
  // jamf();
}
