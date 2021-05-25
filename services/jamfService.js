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

    // get libCalList based on pkg.libCalCid
    let libCalBookings = await libCal.getCurrentValidBookings(pkg.libCalCid);
    // console.log(pkg.libCalCid, libCalBookings.length);
    let libCalEmails = libCal.getUniqueEmailsFromBookings(libCalBookings);
    logger.debug('libCalEmails:', { content: libCalEmails });

    // get jamf list based on pkg.vendorGroupId
    let currJamfEmails = await jamf.getGroupMembers(pkg.vendorGroupId);
    logger.debug('currJamfEmails:', { content: currJamfEmails });

    // Fake Data: to use this, comment out the code above and uncomment these two lines
    // let libCalEmails = ['irwinkr@miamioh.edu', 'bomholmm@miamioh.edu'];
    // let currJamfEmails = ['irwinkr@miamioh.edu', 'qum@miamioh.edu'];

    // convert emails if necessary
    libCalEmails = await emailConverterService(libCalEmails);

    // compare: get users to remove in Jamf
    let emailsToRemove = filterToEntriesMissingFromSecondArray(
      currJamfEmails,
      libCalEmails
    );
    logger.info('Jamf emails to remove', emailsToRemove);

    // compare: get users to add in Jamf
    let emailsToAdd = filterToEntriesMissingFromSecondArray(
      libCalEmails,
      currJamfEmails
    );
    logger.info('Jamf emails to add', emailsToAdd);

    // foreach email to add, get the libCal object, modified with an authorizedEmail
    // let authLibCalBookings = emailObjectConverterService(libCalBookings);
    // then with each libcal object, check to see if they have a Jamf account
    // and add one if they do not

    // jamf remove
    logger.info('Jamf Remove:', { content: emailsToRemove });
    if (emailsToRemove.length > 0) {
      res = await jamf.deleteUsersFromGroup(pkg.vendorGroupId, emailsToRemove);
      logger.info('Response from Jamf remove request', { status: res.status });
    }

    // jamf add
    logger.info('Jamf Add:', { content: emailsToAdd });
    if (emailsToAdd.length > 0) {
      res = await jamf.addUsersToGroup(pkg.vendorGroupId, emailsToAdd);
      logger.info('Response from Jamf add request', { status: res.status });
    }
  });
};
