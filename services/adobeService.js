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
  logger.info('adobeService: starting AdobeService');
  let i = 0;

  asyncForEach(software, async (pkg) => {
    i++;
    logger.info(
      `adobeService: starting AdobeService for ${pkg.vendorGroupName} (pid:${pid}-${i})`
    );
    logger.info(
      `adobeService: Getting libCalCid (pid:${pid}): ${pkg.libCalCid}, vendorGroupName: ${pkg.vendorGroupName}, vendorGroupId: ${pkg.vendorGroupId}`
    );

    // get libCalList based on pkg.libCalCid
    let libCalBookings = await libCal.getCurrentValidBookings(pkg.libCalCid);
    // console.log(pkg.libCalCid, libCalBookings.length);
    let libCalEmails = libCal.getUniqueEmailsFromBookings(libCalBookings);
    logger.debug(
      `adobeService: libCalEmails (Adobe group:${pkg.vendorGroupName}):(pid:${pid}-${i}):`,
      {
        content: libCalEmails,
      }
    );
    // // get adobe list based on pkg.vendorGroupName
    let group;
    if (pkg.hasOwnProperty('vendorGroupId')) {
      group = pkg.vendorGroupId;
    } else {
      group = pkg.vendorGroupName;
    }
    let currAdobeEntitlements = await adobe.getGroupMembers(group);
    logger.info(
      `adobeService: length of currAdobeEntitlements: ${currAdobeEntitlements.length} (group:${pkg.vendorGroupName}) (pid:${pid}-${i})`
    );
    // console.log('currAdobeEntitlements:', currAdobeEntitlements.length);
    let currAdobeEmails = adobe.getEmailsFromGroupMembers(
      currAdobeEntitlements
    );
    logger.debug(
      `adobeService: currAdobeEmails (group:${pkg.vendorGroupName}):(pid:${pid}-${i}):`,
      { content: currAdobeEmails }
    );
    logger.info(
      `adobeService: length of currAdobeEmails: ${currAdobeEmails.length} (pid:${pid}-${i})`
    );
    // Fake Data: to use this, comment out the code above and uncomment these two lines
    // let libCalBookings = ['irwinkr@miamioh.edu', 'bomholmm@miamioh.edu'];
    // let currAdobeEmails = ['irwinkr@miamioh.edu', 'qum@miamioh.edu'];

    // convert emails if necessary
    logger.info(
      `adobeService: Adobe starting emailConverterService (pid:${pid}-${i})`
    );
    try {
      libCalEmails = await emailConverterService(libCalEmails);
    } catch (err) {
      logger.error(
        `adobeService: Adobe failed emailConverterService (pid:${pid}-${i})`,
        {
          content: err,
        }
      );
    }
    logger.info(
      `adobeService: Adobe finished emailConverterService (pid:${pid}-${i})`
    );

    logger.info(
      `adobeService: length of libCalEmails: ${libCalEmails.length} (pid:${pid}-${i})`
    );

    logger.info(
      `adobeService: starting Adobe emailsToRemove (group:${pkg.vendorGroupName}) (pid:${pid}-${i})`
    );
    // compare: get users to remove in Adobe
    let emailsToRemove = filterToEntriesMissingFromSecondArray(
      currAdobeEmails,
      libCalEmails
    );

    logger.info(
      `adobeService: starting Adobe emailsToAdd (group:${pkg.vendorGroupName}) (pid:${pid}-${i})`
    );
    // compare: get users to add in Adobe
    let emailsToAdd = filterToEntriesMissingFromSecondArray(
      libCalEmails,
      currAdobeEmails
    );
    logger.info(
      `adobeService: finished Adobe emailsToAdd (group:${pkg.vendorGroupName}) (pid:${pid}-${i})`
    );

    // adobe remove
    logger.info(
      `adobeService: Adobe Remove:(group:${pkg.vendorGroupName})(pid:${pid}-${i}):${emailsToRemove.length}`,
      {
        content: emailsToRemove,
      }
    );
    if (emailsToRemove.length > 0) {
      res = await adobe.removeGroupMembers(emailsToRemove, pkg.vendorGroupName);
      logger.info(
        `adobeService: Response from Adobe remove request (group:${pkg.vendorGroupName})(pid:${pid}-${i})`,
        {
          content: res,
          status: res.status,
        }
      );
    }

    // adobe add
    logger.info(
      `adobeService: Adobe Add:(group:${pkg.vendorGroupName})(pid:${pid}-${i}):${emailsToAdd.length}`,
      {
        content: emailsToAdd,
      }
    );
    if (emailsToAdd.length > 0) {
      res = await adobe.addGroupMembers(emailsToAdd, group);
      logger.info(
        `adobeService: Response from Adobe add request (group:${pkg.vendorGroupName})(pid:${pid}-${i})`,
        {
          status: res.status,
          content: res,
        }
      );
    }
    logger.info(
      `adobeService: AdobeService finished for ${pkg.vendorGroupName} (pid:${pid}-${i})`
    );
  });
};
