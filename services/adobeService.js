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
software = software.filter((i) => parseInt(i.libCalCid) > 20000);
console.log(software);

logger.info('starting AdobeService');

utils.asyncForEach(software, async (pkg) => {
  console.log('Getting:', pkg.libCalCid, pkg.vendorGroupName);

  // get libCalList based on pkg.libCalCid
  // let libCalBookings = await libCal.getCurrentValidBookings(pkg.libCalCid);
  // console.log(pkg.libCalCid, libCalBookings.length);

  // // get adobe list based on pkg.vendorGroupName
  // let currAdobeEntitlements = await adobe.getGroupMembers(pkg.vendorGroupName);
  // console.log('currAdobeEntitlements:', currAdobeEntitlements.length);
  // let currAdobeEmails = adobe.getEmailsFromGroupMembers(currAdobeEntitlements);
  // console.log(currAdobeEmails);

  // Fake Data:
  let libCalBookings = ['irwinkr@miamioh.edu', 'bomholmm@miamioh.edu'];
  let currAdobeEmails = ['irwinkr@miamioh.edu', 'qum@miamioh.edu'];

  // we're skipping this step so far:
  // convert emails if necessary?

  // compare: get users to remove in Adobe
  let emailsToRemove = utils.filterToEntriesMissingFromSecondArray(
    currAdobeEmails,
    libCalBookings
  );

  // compare: get users to add in Adobe
  let emailsToAdd = utils.filterToEntriesMissingFromSecondArray(
    libCalBookings,
    currAdobeEmails
  );

  // adobe remove
  console.log('Remove', emailsToRemove);
  if (emailsToRemove.length > 0) {
    res = await adobe.removeGroupMembers(
      emailsToRemove,
      pkg.vendorGroupName,
      'test'
    );
    console.log(res);
  }

  // adobe add
  console.log('Add', emailsToAdd);
  if (emailsToAdd.length > 0) {
    res = await adobe.addGroupMembers(emailsToAdd, pkg.vendorGroupName, 'test');
    console.log(res);
  }
});
