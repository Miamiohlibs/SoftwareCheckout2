const appConf = require('./config/appConf');
const LicenseGroup = require('./helpers/LicenseGroup');
const lg = new LicenseGroup(appConf);
const adobe = require('./services/AdobeService');
const jamf = require('./services/jamfService');
let vendors = lg.getActiveVendors();

async () => {
  if (vendors.includes('Adobe')) {
    await adobe();
  }

  if (vendors.includes('Jamf')) {
    await jamf();
  }
};
