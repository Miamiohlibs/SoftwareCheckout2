const AdobeUserMgmtApi = require('./classes/AdobeUserMgmtApi');
const adobeConf = require('./config/adobe');
const adobe = new AdobeUserMgmtApi(adobeConf);
const appConf = require('./config/appConf');
const LicenseGroup = require('./classes/LicenseGroup');
const lg = new LicenseGroup(appConf);

let adobeLicenses = lg.getVendorGroupNamesByVendor('Adobe');
// console.log(adobeLicenses);

let group = adobeLicenses[1];

(async () => {
  try {
    await adobe.getToken();
    // let url =
    //   'https://usermanagement.adobe.io/v2/usermanagement/users/357BEB1C55C13CD77F000101@AdobeOrg/0/';
    let fetchres = await adobe.getGroupMembers(group);
    console.log(fetchres);
  } catch (err) {
    console.error('Unable to do the thing:', err);
  }
})();
