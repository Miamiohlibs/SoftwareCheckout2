const adobeConf = require('../config/adobe');
const AdobeRepo = require('../repositories/AdobeRepository');
const adobe = new AdobeRepo(adobeConf);
const libCalConf = require('../config/libCal');
const LibCalRepo = require('../repositories/LibCalRepository');
const libCal = new LibCalRepo(libCalConf);
const appConf = require('../config/appConf');
const LicenseGroup = require('../classes/LicenseGroup');
const licenses = new LicenseGroup(appConf);
const logger = require('./logger');

const software = licenses.getLicenseGroupsByVendor('Adobe');
console.log(software);

logger.info('starting AdobeService');

software.forEach((pkg) => {
  // get libCalList based on pkg.libCalCid
  // get adobe list based on pkg.vendorGroupName
  // convert emails if necessary?
  // compare: get users to add in Adobe
  // compare: get users to remove in Adobe
  // adobe remove
  // adobe add
});
