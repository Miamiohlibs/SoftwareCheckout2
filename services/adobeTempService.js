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
  console.log('adobeTempService: starting AdobeService');
  let i = 0;

  asyncForEach(software, async (pkg) => {
    i++;
    console.log(
      `adobeTempService: starting AdobeService for ${pkg.vendorGroupName} (pid:${pid}-${i})`,
    );
    console.log(
      `adobeTempService: Getting libCalCid (pid:${pid}): ${pkg.libCalCid}, vendorGroupName: ${pkg.vendorGroupName}, vendorGroupId: ${pkg.vendorGroupId}`,
    );

    // get libCalList based on pkg.libCalCid
    let libCalBookings = await libCal.getCurrentValidBookings(pkg.libCalCid);
    // console.log(pkg.libCalCid, libCalBookings.length);
    let libCalEmails = libCal.getUniqueEmailsFromBookings(libCalBookings);
    logger.debug(
      `adobeTempService: libCalEmails (Adobe group:${pkg.vendorGroupName}):(pid:${pid}-${i}):`,
      {
        content: libCalEmails,
      },
    );
    // // get adobe list based on pkg.vendorGroupName
    let group;
    if (pkg.hasOwnProperty('vendorGroupId')) {
      group = pkg.vendorGroupId;
    } else {
      group = pkg.vendorGroupName;
    }
    let currAdobeEntitlements = await adobe.getGroupMembers(group);
    console.log(
      `adobeTempService: length of currAdobeEntitlements: ${currAdobeEntitlements.length} (group:${pkg.vendorGroupName}) (pid:${pid}-${i})`,
    );
    // console.log('currAdobeEntitlements:', currAdobeEntitlements.length);
    let currAdobeEmails = adobe.getEmailsFromGroupMembers(
      currAdobeEntitlements,
    );
    console.log(
      `adobeTempService: currAdobeEmails (group:${pkg.vendorGroupName}):(pid:${pid}-${i}):`,
      { content: currAdobeEmails },
    );
    console.log(
      `adobeTempService: length of currAdobeEmails: ${currAdobeEmails.length} (pid:${pid}-${i})`,
    );
    // Fake Data: to use this, comment out the code above and uncomment these two lines
    // let libCalBookings = ['irwinkr@miamioh.edu', 'bomholmm@miamioh.edu'];
    // let currAdobeEmails = ['irwinkr@miamioh.edu', 'qum@miamioh.edu'];

    console.log(
      `adobeTempService: length of libCalEmails: ${libCalEmails.length} (pid:${pid}-${i})`,
    );

    console.log(
      `adobeTempService: starting Adobe emailsToRemove (group:${pkg.vendorGroupName}) (pid:${pid}-${i})`,
    );
    // compare: get users to remove in Adobe
    let emailsToRemove = filterToEntriesMissingFromSecondArray(
      currAdobeEmails,
      libCalEmails,
    );

    console.log(
      `adobeTempService: starting Adobe emailsToAdd (group:${pkg.vendorGroupName}) (pid:${pid}-${i})`,
    );
    // compare: get users to add in Adobe
    let emailsToAdd = filterToEntriesMissingFromSecondArray(
      libCalEmails,
      currAdobeEmails,
    );
    console.log(
      `adobeTempService: emailsToAdd (group:${pkg.vendorGroupName}): ${JSON.stringify(emailsToAdd)}`,
    );
    console.log(
      `adobeTempService: finished Adobe emailsToAdd (group:${pkg.vendorGroupName}) (pid:${pid}-${i})`,
    );

    console.log(
      `adobeTempService: AdobeService finished for ${pkg.vendorGroupName} (pid:${pid}-${i})`,
    );
  });
};
