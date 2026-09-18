const process = require('process');
const miamiDamConf = require('../config/miamiDam');
const MiamiDamRepo = require('../repositories/MiamiDamRepository');
const miamiDam = new MiamiDamRepo(miamiDamConf);
const libCalConf = require('../config/libCal');
const LibCalRepo = require('../repositories/LibCalRepository');
const libCal = new LibCalRepo(libCalConf);
const appConf = require('../config/appConf');
const LicenseGroup = require('../helpers/LicenseGroup');
const licenses = new LicenseGroup(appConf);
const logger = require('./logger');
let software = licenses.getLicenseGroupsByVendor('MiamiDam');
let pid = process.pid;

module.exports = async () => {
  logger.info('miamiDamService: starting miamiDamService');
  let i = 0;
  asyncForEach(software, async (pkg) => {
    i++;
    logger.info(
      `miamiDamService: starting miamiDamService for ${pkg.vendorGroupName} (pid:${pid}-${i})`,
    );
    logger.info(
      `miamiDamService: Getting libCalCid (pid:${pid}): ${pkg.libCalCid}, vendorGroupName: ${pkg.vendorGroupName}, vendorGroupId: ${pkg.vendorGroupId}`,
    );

    // get libCalList based on pkg.libCalCid
    let libCalBookings = await libCal.getCurrentValidBookings(pkg.libCalCid);
    // console.log(pkg.libCalCid, libCalBookings.length);
    let libCalEmails = libCal.getUniqueEmailsFromBookings(libCalBookings);
    logger.debug(
      `miamiDamService: libCalEmails (miamiDam group:${pkg.vendorGroupName}):(pid:${pid}-${i}):`,
      {
        content: libCalEmails,
      },
    );
    // // get miamiDam list based on pkg.vendorGroupName
    let group;
    if (pkg.hasOwnProperty('vendorGroupId')) {
      group = pkg.vendorGroupId;
    } else {
      group = pkg.vendorGroupName;
    }
    let currAdobeEntitlements = await miamiDam.getGroupMembers(group);
    logger.info(
      `miamiDamService: length of currAdobeEntitlements: ${currAdobeEntitlements.length} (group:${pkg.vendorGroupName}) (pid:${pid}-${i})`,
    );
    // console.log('currAdobeEntitlements:', currAdobeEntitlements.length);
    let currMiamiDamEmails = miamiDam.getEmailsFromGroupMembers(
      currAdobeEntitlements,
    );
    logger.debug(
      `miamiDamService: currMiamiDamEmails (group:${pkg.vendorGroupName}):(pid:${pid}-${i}):`,
      { content: currMiamiDamEmails },
    );
    logger.info(
      `miamiDamService: length of currMiamiDamEmails: ${currMiamiDamEmails.length} (pid:${pid}-${i})`,
    );

    // convert emails if necessary
    logger.info(
      `miamiDamService: Adobe starting emailConverterService (pid:${pid}-${i})`,
    );
    try {
      libCalEmails = await emailConverterService(libCalEmails);
    } catch (err) {
      logger.error(
        `miamiDamService: Adobe failed emailConverterService (pid:${pid}-${i})`,
        {
          content: err,
        },
      );
    }
    logger.info(
      `miamiDamService: finished emailConverterService (pid:${pid}-${i})`,
    );

    logger.info(
      `miamiDamService: length of libCalEmails: ${libCalEmails.length} (pid:${pid}-${i})`,
    );

    logger.info(
      `miamiDamService: starting miamiDam emailsToRemove (group:${pkg.vendorGroupName}) (pid:${pid}-${i})`,
    );
    // compare: get users to remove in Adobe
    let emailsToRemove = filterToEntriesMissingFromSecondArray(
      currMiamiDamEmails,
      libCalEmails,
    );

    logger.info(
      `miamiDamService: starting miamiDam emailsToAdd (group:${pkg.vendorGroupName}) (pid:${pid}-${i})`,
    );
    // compare: get users to add in Adobe
    let emailsToAdd = filterToEntriesMissingFromSecondArray(
      libCalEmails,
      currMiamiDamEmails,
    );
    logger.info(
      `miamiDamService: finished miamiDam emailsToAdd (group:${pkg.vendorGroupName}) (pid:${pid}-${i})`,
    );

    // adobe remove
    logger.info(
      `miamiDamService: miamiDam Remove:(group:${pkg.vendorGroupName})(pid:${pid}-${i}):${emailsToRemove.length}`,
      {
        content: emailsToRemove,
      },
    );
    if (emailsToRemove.length > 0) {
      res = await miamiDam.removeGroupMembers(
        emailsToRemove,
        pkg.vendorGroupName,
      );
      logger.info(
        `miamiDamService: Response from miamiDam remove request (group:${pkg.vendorGroupName})(pid:${pid}-${i})`,
        {
          content: res,
          status: res.status,
        },
      );
    }

    // adobe add
    logger.info(
      `miamiDamService: miamiDam Add:(group:${pkg.vendorGroupName})(pid:${pid}-${i}):${emailsToAdd.length}`,
      {
        content: emailsToAdd,
      },
    );
    if (emailsToAdd.length > 0) {
      res = await miamiDam.addGroupMembers(emailsToAdd, group);
      logger.info(
        `miamiDamService: Response from miamiDam add request (group:${pkg.vendorGroupName})(pid:${pid}-${i})`,
        {
          status: res.status,
          content: res,
        },
      );
    }
    logger.info(
      `miamiDamService: miamiDamService finished for ${pkg.vendorGroupName} (pid:${pid}-${i})`,
    );
  });
};
