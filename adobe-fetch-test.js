const AdobeUserMgmtApi = require('./classes/AdobeUserMgmtApi');
const adobeConf = require('./config/adobe');
const AdobeService = require('./classes/AdobeUserMgmtService');
const adobe = new AdobeUserMgmtApi(adobeConf);
const serv = new AdobeService(adobeConf);
const appConf = require('./config/appConf');
const LicenseGroup = require('./classes/LicenseGroup');
const lg = new LicenseGroup(appConf);

let adobeLicenses = lg.getVendorGroupNamesByVendor('Adobe');
// console.log(adobeLicenses);

// let group = adobeLicenses[1];
let group = 'Library API test';

(async () => {
  try {
    // await adobe.getToken();
    // console.log(serv);
    let res = await serv.getGroupMembers(group);
    // let res = await adobe.getQueryResults(qc);
    console.log(res);
    // console.log(fetchres);
  } catch (err) {
    console.error('Unable to do the thing:', err);
  }
})();
