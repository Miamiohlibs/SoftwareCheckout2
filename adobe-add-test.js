const AdobeUserMgmtService = require('./classes/AdobeUserMgmtService');
const adobeConf = require('./config/adobe');
const adobe = new AdobeUserMgmtService(adobeConf);
const appConf = require('./config/appConf');
const LicenseGroup = require('./classes/LicenseGroup');
// const AdobeUserMgmtService = require('./classes/AdobeUserMgmtService');
const lg = new LicenseGroup(appConf);

// let adobeLicenses = lg.getVendorGroupNamesByVendor('Adobe');
// console.log(adobeLicenses);

let group = 'Library API test';

(async () => {
  try {
    // await adobe.getToken();
    let res = await adobe.addMembersToGroup(
      [
        'qum@miamioh.edu',
        'yarnete@miamioh.edu',
        'irwinkr@miamioh.edu',
        'hawkpf@miamioh.edu',
        'diebelsa@miamioh.edu',
        'brownsj1@miamioh.edu',
        'bomholmm@miamioh.edu',
        'kaiserj5@miamioh.edu',
        'calabrcm@miamioh.edu',
        'conleyj@miamioh.edu',
        'wegnera3@miamioh.edu',
      ],
      group,
      'test'
    ); //adobe.getGroupMembers(group);
    console.log(res);
  } catch (err) {
    console.error('Unable to do the thing:', err);
  }
})();
