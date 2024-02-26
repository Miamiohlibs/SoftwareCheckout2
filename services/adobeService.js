const process = require('process');
const adobeConf = require('../config/adobe');
const AdobeRepo = require('../repositories/AdobeRepository');
const adobe = new AdobeRepo(adobeConf);
const libCalConf = require('../config/libCal');
const LibCalRepo = require('../repositories/LibCalRepository');
const libCal = new LibCalRepo(libCalConf);
const appConf = require('../config/appConf');
const LicenseGroup = require('../helpers/LicenseGroup');
const licenses = new LicenseGroup(appConf);
const logger = require('./logger');
const emailConverterService = require('../services/emailConverterService');
const {
  asyncForEach,
  filterToEntriesMissingFromSecondArray,
} = require('../helpers/utils');
let software = licenses.getLicenseGroupsByVendor('Adobe');
let pid = process.pid;

// uncomment this line to only do the staff CC list:
// software = software.filter((i) => parseInt(i.libCalCid) > 20000);

module.exports = async () => {
  logger.info('starting AdobeService');

  asyncForEach(software, async (pkg) => {
    logger.info(
      `Getting libCalCid (pid:${pid}): ${pkg.libCalCid}, vendorGroupName: ${pkg.vendorGroupName}, vendorGroupId: ${pkg.vendorGroupId}`
    );

    // get libCalList based on pkg.libCalCid
    let libCalBookings = await libCal.getCurrentValidBookings(pkg.libCalCid);
    // console.log(pkg.libCalCid, libCalBookings.length);
    let libCalEmails = libCal.getUniqueEmailsFromBookings(libCalBookings);
    logger.debug(`libCalEmails (Adobe):(pid:${pid}):`, {
      content: libCalEmails,
    });
    // // get adobe list based on pkg.vendorGroupName
    let group;
    if (pkg.hasOwnProperty('vendorGroupId')) {
      group = pkg.vendorGroupId;
    } else {
      group = pkg.vendorGroupName;
    }
    let currAdobeEntitlements = await adobe.getGroupMembers(group);
    logger.info(
      `length of currAdobeEntitlements: ${currAdobeEntitlements.length} (pid:${pid})`
    );
    // console.log('currAdobeEntitlements:', currAdobeEntitlements.length);
    let currAdobeEmails = adobe.getEmailsFromGroupMembers(
      currAdobeEntitlements
    );
    logger.debug(`currAdobeEmails:(pid:${pid}):`, { content: currAdobeEmails });
    logger.info(
      `length of currAdobeEmails: ${currAdobeEmails.length} (pid:${pid})`
    );
    // Fake Data: to use this, comment out the code above and uncomment these two lines
    // let libCalBookings = ['irwinkr@miamioh.edu', 'bomholmm@miamioh.edu'];
    // let currAdobeEmails = ['irwinkr@miamioh.edu', 'qum@miamioh.edu'];

    // convert emails if necessary
    logger.info(`starting emailConverterService (pid:${pid})`);
    try {
      libCalEmails = await emailConverterService(libCalEmails);
    } catch (err) {
      logger.error(`failed emailConverterService (pid:${pid})`, { error: err });
    }
    logger.info(`finished emailConverterService (pid:${pid})`);

    logger.info(`length of libCalEmails: ${libCalEmails.length} (pid:${pid})`);

    logger.info(`starting Adobe emailsToRemove (pid:${pid})`);
    // compare: get users to remove in Adobe
    let emailsToRemove = filterToEntriesMissingFromSecondArray(
      currAdobeEmails,
      libCalEmails
    );

    logger.info(`starting Adobe emailsToAdd (pid:${pid})`);
    // compare: get users to add in Adobe
    let emailsToAdd = filterToEntriesMissingFromSecondArray(
      libCalEmails,
      currAdobeEmails
    );
    logger.info(`finished Adobe emailsToAdd (pid:${pid})`);

    // adobe remove
    logger.info(`Adobe Remove:(pid:${pid}):${emailsToRemove.length}`, {
      content: emailsToRemove,
    });
    if (emailsToRemove.length > 0) {
      res = await adobe.removeGroupMembers(emailsToRemove, pkg.vendorGroupName);
      logger.info(`Response from Adobe remove request(pid:${pid})`, {
        status: res.status,
      });
    }

    // adobe add
    logger.info(`Adobe Add:(pid:${pid}):${emailsToAdd.length}`, {
      content: emailsToAdd,
    });
    if (emailsToAdd.length > 0) {
      res = await adobe.addGroupMembers(emailsToAdd, group);
      logger.info(`Response from Adobe add request (pid:${pid})`, {
        status: res.status,
      });
    }
  });
};
