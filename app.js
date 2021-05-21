const appConf = require('./config/appConf');
const LicenseGroup = require('./helpers/LicenseGroup');
const lg = new LicenseGroup(appConf);
const adobe = require('./services/AdobeService');
const jamf = require('./services/jamfService');
let vendors = lg.getActiveVendors();
let logger = require('./services/logger');

logger.info('starting app');

(async () => {
  if (vendors.includes('Adobe')) {
    logger.info('starting Adobe service from app.js');
    await adobe();
  }

  if (vendors.includes('Jamf')) {
    logger.info('starting jamf service from app.js');
    await jamf();
  }
})();
