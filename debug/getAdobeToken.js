const adobeConf = require('../config/adobe');
const AdobeApi = require('../classes/AdobeUserMgmtApi');

// get Adobe Token
const adobe = new AdobeApi(adobeConf);
(async () => {
  try {
    await adobe.getToken();
    console.log('Adobe token:', adobe.accessToken);
    console.log('ClientId:', adobe.credentials.clientId);
  } catch (err) {
    console.error('Unable to get Adobe token:', err);
  }
})();
