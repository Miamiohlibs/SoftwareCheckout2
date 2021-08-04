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
  logger.info('starting JamfService');

  asyncForEach(software, async (pkg) => {
    logger.info(
      `Getting libCalCid: ${pkg.libCalCid}, vendorGroupName: ${pkg.vendorGroupName}`
    );
    /*
    // get libCalList based on pkg.libCalCid
    let libCalBookings = await libCal.getCurrentValidBookings(pkg.libCalCid);
    // console.log(pkg.libCalCid, libCalBookings.length);
    let libCalEmails = libCal.getUniqueEmailsFromBookings(libCalBookings);
    logger.debug(`libCalEmails (Jamf: ${pkg.vendorGroupName}):`, { content: libCalEmails });

    // get jamf list based on pkg.vendorGroupId
    logger.debug('getting Jamf emails');
    let currJamfEmails; 
    try {
      currJamfEmails = await jamf.getGroupMembers(pkg.vendorGroupId);
      logger.debug(`currJamfEmails (Jamf: ${pkg.vendorGroupName}):`, { content: currJamfEmails });

    } catch (err) {
      logger.error('Error getting Jamf group members', { error: err });
    }
    */
    // Fake Data: to use this, comment out the code above and uncomment these two lines
    let libCalEmails = ['irwinkr@miamioh.edu'];
    let currJamfEmails = ['irwinkr@miamioh.edu', 'kaiserj5@miamioh.edu'];

    // convert emails if necessary
    libCalEmails = await emailConverterService(libCalEmails);
    logger.debug('converted libCalEmails', libCalEmails);

    // compare: get users to add in Jamf
    let emailsToAdd;
    try {
      emailsToAdd = filterToEntriesMissingFromSecondArray(
        libCalEmails,
        currJamfEmails
      );
      logger.info('Jamf emails to add', emailsToAdd);
    } catch (err) {
      logger.error('Error filtering to Jamf emails to add', err);
    }

    // foreach email to add, get the libCal object, modified with an authorizedEmail
    // let authLibCalBookings = emailObjectConverterService(libCalBookings);
    // then with each libcal object, check to see if they have a Jamf account
    // and add one if they do not

    // jamf add
    logger.info('Jamf Add:', { content: emailsToAdd });

    if (emailsToAdd.length > 0) {
      for (i in emailsToAdd) {
        email = emailsToAdd[i];
        try {
          logger.debug('initiating createUserIfNeeded for ' + email);
          let res = await jamf.createUserIfNeeded(email);
          logger.debug('response from createUserIfNeeded', res);
        } catch (err) {
          logger.error('jamfRepo createUserIfNeeded failed for ' + email, err);
        }
      }
    }
  });
};
