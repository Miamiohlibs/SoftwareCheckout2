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
  logger.info(
    `Getting libCalCid: ${pkg.libCalCid}, vendorGroupName: ${pkg.vendorGroupName}`
  );

  // get libCalList based on pkg.libCalCid
  let libCalBookings = await libCal.getCurrentValidBookings(pkg.libCalCid);
  // console.log(pkg.libCalCid, libCalBookings.length);
  let libCalEmails = libCal.getUniqueEmailsFromBookings(libCalBookings);
  logger.debug('libCalEmails:', { content: libCalEmails });
  // // get adobe list based on pkg.vendorGroupName
  let currAdobeEntitlements = await adobe.getGroupMembers(pkg.vendorGroupName);
  // console.log('currAdobeEntitlements:', currAdobeEntitlements.length);
  let currAdobeEmails = adobe.getEmailsFromGroupMembers(currAdobeEntitlements);
  logger.debug('currAdobeEmails:', { content: currAdobeEmails });

  // Fake Data: to use this, comment out the code above and uncomment these two lines
  // let libCalBookings = ['irwinkr@miamioh.edu', 'bomholmm@miamioh.edu'];
  // let currAdobeEmails = ['irwinkr@miamioh.edu', 'qum@miamioh.edu'];

  // we're skipping this step so far:
  // convert emails if necessary?

  // compare: get users to remove in Adobe
  let emailsToRemove = utils.filterToEntriesMissingFromSecondArray(
    currAdobeEmails,
    libCalEmails
  );

  // compare: get users to add in Adobe
  let emailsToAdd = utils.filterToEntriesMissingFromSecondArray(
    libCalEmails,
    currAdobeEmails
  );

  // adobe remove
  logger.info('Adobe Remove:', { content: emailsToRemove });
  if (emailsToRemove.length > 0) {
    res = await adobe.removeGroupMembers(emailsToRemove, pkg.vendorGroupName);
    logger.info(res);
  }

  // adobe add
  logger.info('Adobe Add:', { content: emailsToAdd });
  if (emailsToAdd.length > 0) {
    res = await adobe.addGroupMembers(emailsToAdd, pkg.vendorGroupName);
    logger.info(res);
  }
});
