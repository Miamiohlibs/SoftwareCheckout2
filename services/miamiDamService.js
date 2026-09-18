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
const {
  asyncForEach,
  filterToEntriesMissingFromSecondArray,
} = require('../helpers/utils');
let software = licenses.getLicenseGroupsByVendor('MiamiDam');
let pid = process.pid;

module.exports = async () => {
  logger.info('miamiDamService: starting miamiDamService');
  logger.info(`software: ${JSON.stringify(software)}`);
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
    console.log(`libCalBookings is array? ${Array.isArray(libCalBookings)}`);
    console.log(`libCalBookings: ${libCalBookings}`);
    // console.log(pkg.libCalCid, libCalBookings.length);
    let libCalEmails = libCal.getUniqueEmailsFromBookings(libCalBookings);
    console.log(`libCalEmails is array? ${Array.isArray(libCalEmails)}`);
    console.log(`libCalEmails: ${JSON.stringify(libCalEmails)}`);
    logger.debug(
      `miamiDamService: libCalEmails (miamiDam group:${pkg.vendorGroupName}):(pid:${pid}-${i}):`,
      {
        content: libCalEmails,
      },
    );
    // // get miamiDam list based on pkg.vendorGroupId
    let currMiamiEntitlements = await miamiDam.getGroupMembers(
      pkg.vendorGroupId,
    );
    logger.info(
      `miamiDamService: length of currMiamiEntitlements: ${currMiamiEntitlements.length} (group:${pkg.vendorGroupName}) (pid:${pid}-${i})`,
    );
    let currMiamiDamEmails = miamiDam.getEmailsFromGroupMembers(
      currMiamiEntitlements,
    );
    logger.debug(
      `miamiDamService: currMiamiDamEmails (group:${pkg.vendorGroupName}):(pid:${pid}-${i}):`,
      { content: currMiamiDamEmails },
    );
    logger.info(
      `miamiDamService: length of currMiamiDamEmails: ${currMiamiDamEmails.length} (pid:${pid}-${i})`,
    );

    logger.info(
      `miamiDamService: length of libCalEmails: ${libCalEmails.length} (pid:${pid}-${i})`,
    );

    logger.info(
      `miamiDamService: starting miamiDam emailsToRemove (group:${pkg.vendorGroupName}) (pid:${pid}-${i})`,
    );
    // compare: get users to remove in MiamiDam
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

    // miamiDam remove
    logger.info(
      `miamiDamService: miamiDam Remove:(group:${pkg.vendorGroupName})(pid:${pid}-${i}):${emailsToRemove.length}`,
      {
        content: emailsToRemove,
      },
    );
    if (emailsToRemove.length > 0) {
      const usersToRemove = miamiDam.getMemberIdsFromEmails(emailsToRemove);
      res = await miamiDam.removeGroupMembers(usersToRemove, pkg.vendorGroupId);
      logger.info(
        `miamiDamService: Response from miamiDam remove request (group:${pkg.vendorGroupName})(pid:${pid}-${i})`,
        {
          content: res,
          status: res.status,
        },
      );
    }

    // miamiDam add
    logger.info(
      `miamiDamService: miamiDam Add:(group:${pkg.vendorGroupName})(pid:${pid}-${i}):${emailsToAdd.length}`,
      {
        content: emailsToAdd,
      },
    );
    if (emailsToAdd.length > 0) {
      const usersToAdd = miamiDam.getMemberIdsFromEmails(emailsToAdd);
      res = await miamiDam.addGroupMembers(usersToAdd, pkg.vendorGroupId);
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
