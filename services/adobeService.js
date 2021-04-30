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
const Utils = require('../classes/Utils');
const utils = new Utils();
let software = licenses.getLicenseGroupsByVendor('Adobe');
// console.log(software);

logger.info('starting AdobeService');

utils.asyncForEach(software, async (pkg) => {
  console.log('Getting:', pkg.libCalCid, pkg.vendorGroupName);

  // get libCalList based on pkg.libCalCid
  let libCalBookings = await libCal.getCurrentValidBookings(pkg.libCalCid);
  console.log(pkg.libCalCid, libCalBookings.length);

  // get adobe list based on pkg.vendorGroupName
  let adobeEntitlements = await adobe.getGroupMembers(pkg.vendorGroupName);
  console.log('adobeEntitlements:', adobeEntitlements.length);
  let adobeEmails = adobe.getEmailsFromGroupMembers(adobeEntitlements);
  console.log(adobeEmails);

  // convert emails if necessary?
  // compare: get users to add in Adobe
  // compare: get users to remove in Adobe
  // adobe remove
  // adobe add
});
