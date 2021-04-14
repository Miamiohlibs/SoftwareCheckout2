const AdobeUserMgmtApi = require('./classes/AdobeUserMgmtApi');
const adobeConf = require('./config/adobe');
const adobe = new AdobeUserMgmtApi(adobeConf);

(async () => {
  try {
    await adobe.getToken();
    let url =
      'https://usermanagement.adobe.io/v2/usermanagement/users/357BEB1C55C13CD77F000101@AdobeOrg/0/';
    console.log('Sending multiple queries - this will take a few minutes...');
    let res = await adobe.getPaginatedResults('GET', url, 'users');
    console.log('Total Results from Query:', res.length);
  } catch (err) {
    console.error('Unable to do the thing:', err);
  }
})();
