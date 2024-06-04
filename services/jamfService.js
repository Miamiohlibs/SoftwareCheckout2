const jamfConf = require('../config/jamf');
const JamfRepo = require('../repositories/JamfRepository');
const jamf = new JamfRepo(jamfConf);
const libCalConf = require('../config/libCal');
const LibCalRepo = require('../repositories/LibCalRepository');
const libCal = new LibCalRepo(libCalConf);
const appConf = require('../config/appConf');
const LicenseGroup = require('../helpers/LicenseGroup');
const licenses = new LicenseGroup(appConf);
const logger = require('./logger');
const emailConverterService = require('../services/emailConverterService');
const emailObjectConverterService = require('../services/emailObjectConverterService');

const {
  asyncForEach,
  filterToEntriesMissingFromSecondArray,
} = require('../helpers/utils');
let software = licenses.getLicenseGroupsByVendor('Jamf');

module.exports = async () => {
  logger.info('jamfService: starting JamfService');

  asyncForEach(software, async (pkg) => {
    logger.info(
      `jamfService: Getting libCalCid: ${pkg.libCalCid}, vendorGroupName: ${pkg.vendorGroupName}`
    );
    // get libCalList based on pkg.libCalCid
    let libCalBookings = await libCal.getCurrentValidBookings(pkg.libCalCid);
    // console.log(pkg.libCalCid, libCalBookings.length);
    let libCalEmails = libCal.getUniqueEmailsFromBookings(libCalBookings);
    logger.debug(`jamfService: libCalEmails (Jamf: ${pkg.vendorGroupName}):`, {
      content: libCalEmails,
    });

    // get jamf list based on pkg.vendorGroupId
    logger.debug('jamfService: getting Jamf emails');
    let currJamfEmails;
    try {
      currJamfEmails = await jamf.getGroupMembers(pkg.vendorGroupId);
      logger.debug(
        `jamfService: currJamfEmails (Jamf: ${pkg.vendorGroupName}):`,
        { content: currJamfEmails }
      );
    } catch (err) {
      logger.error('jamfService: Error getting Jamf group members', {
        error: err,
      });
    }
    // Fake Data: to use this, comment out the code above and uncomment these two lines
    //     let libCalEmails = ['irwinkr@miamioh.edu'];
    //     let currJamfEmails = ['irwinkr@miamioh.edu', 'kaiserj5@miamioh.edu'];

    // convert emails if necessary
    libCalEmails = await emailConverterService(libCalEmails);
    logger.debug('jamfService: converted libCalEmails', libCalEmails);

    // compare: get users to remove in Jamf
    let emailsToRemove;
    try {
      emailsToRemove = filterToEntriesMissingFromSecondArray(
        currJamfEmails,
        libCalEmails
      );
      logger.info('jamfService: Jamf emails to remove', emailsToRemove);
    } catch (err) {
      logger.error(
        'jamfService: Error filtering to Jamf emails to remove',
        err
      );
    }
    // compare: get users to add in Jamf
    let emailsToAdd;
    try {
      emailsToAdd = filterToEntriesMissingFromSecondArray(
        libCalEmails,
        currJamfEmails
      );
      logger.info('jamfService: Jamf emails to add', emailsToAdd);
    } catch (err) {
      logger.error('jamfService: Error filtering to Jamf emails to add', err);
    }

    // foreach email to add, get the libCal object, modified with an authorizedEmail
    // let authLibCalBookings = emailObjectConverterService(libCalBookings);
    // then with each libcal object, check to see if they have a Jamf account
    // and add one if they do not

    // jamf remove
    logger.info('jamfService: Jamf Remove:', { content: emailsToRemove });
    if (emailsToRemove.length > 0) {
      logger.debug(
        'jamfService: About do run jamfRepo.deleteUsersFromGroup on ',
        { data: emailsToRemove }
      );
      res = await jamf.deleteUsersFromGroup(pkg.vendorGroupId, emailsToRemove);
      logger.info('jamfService: Response from Jamf remove request', {
        status: res.status,
      });
    }

    // jamf add
    logger.info('jamfService: Jamf Add:', { content: emailsToAdd });
    if (emailsToAdd.length > 0) {
      asyncForEach(emailsToAdd, async (email) => {
        try {
          logger.debug(
            'jamfService: initiating createUserIfNeeded for ' + email
          );
          let res = await jamf.createUserIfNeeded(email);
          logger.debug('jamfService: response from createUserIfNeeded', res);
        } catch (err) {
          logger.error(
            'jamfService: jamfRepo createUserIfNeeded failed for ' + email,
            err
          );
        }
      });
      logger.debug(
        'jamfService: Finished waiting for updates to Jamf user list'
      );
      logger.debug('jamfService: Adding Jamf users to group', {
        data: emailsToAdd,
      });
      res = await jamf.addUsersToGroup(pkg.vendorGroupId, emailsToAdd);
      logger.debug('jamfService: Finished adding jamf users to groups');
      logger.info('jamfService: Response from Jamf add request', {
        status: res.status,
      });
    }
  });
};
