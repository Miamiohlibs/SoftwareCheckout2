const appConf = require('./config/appConf');
const LicenseGroup = require('./helpers/LicenseGroup');
const lg = new LicenseGroup(appConf);
const adobe = require('./services/adobeService');
const jamf = require('./services/jamfService');
let vendors = lg.getActiveVendors();
let logger = require('./services/logger');

logger.info('starting app');
const vendorString = vendors.join(', ');
logger.info(`vendors activated in config/appConf.js: ${vendorString}`);

(async () => {
  if (vendors.includes('Adobe')) {
    logger.info('starting Adobe service from app.js');
    await adobe();
    // logger.info('Adobe service finished from app.js');
  }

  if (vendors.includes('Jamf')) {
    logger.info('starting jamf service from app.js');
    await jamf();
    // logger.info('jamf service finished from app.js');
  }
})();
