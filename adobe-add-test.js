const AdobeUserMgmtApi = require('./classes/AdobeUserMgmtApi');
const adobeConf = require('./config/adobe');
const adobe = new AdobeUserMgmtApi(adobeConf);
const appConf = require('./config/appConf');
const LicenseGroup = require('./classes/LicenseGroup');
const lg = new LicenseGroup(appConf);

// let adobeLicenses = lg.getVendorGroupNamesByVendor('Adobe');
// console.log(adobeLicenses);

let group = 'Library API test';

(async () => {
  try {
    await adobe.getToken();
    let fetchres = await adobe.addMembersToGroup(
      ['qum1@miamioh.edu'],
      group,
      'test'
    ); //adobe.getGroupMembers(group);
    console.log(fetchres);
  } catch (err) {
    console.error('Unable to do the thing:', err);
  }
})();
