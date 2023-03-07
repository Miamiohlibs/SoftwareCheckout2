module.exports = {
  credentials: {
    clientId: 'da713--------------------89c8be', // REPLACE WITH Adobe Application ID (Client ID)
    technicalAccountId: '41-------------5E48@techacct.adobe.com', // REPLACE WITH Adobe Technical account ID
    orgId: '357-------------------------0101@AdobeOrg', // REPLACE WITH Adobe Org ID
    clientSecret: '10-------------------f4', // REPLACE WITH Adobe Client Secret
    metaScopes: 'ent_user_sdk', // Metascopes
  },

  certs: {
    privateKeyFile: '../certs/private.key', // You will generate this key and upload the public key to Adobe
  },

  /* Do not edit below this line */

  queryConf: {
    getGroups: {
      options: {
        hostname: 'usermanagement.adobe.io',
        port: 443,
        pathStem: '/v2/usermanagement/groups/',
        // path: configure at query time
        method: 'GET',
        headers: {
          Accept: 'application/json',
          // Authorization: configure at query time
          // x-api-key: configure at query time
        },
      },
    },
    generic: {
      options: {
        hostname: 'usermanagement.adobe.io',
        port: 443,
        pathStem: '/v2/usermanagement/',
        // path: configure at query time
        // method: configure at query time
        headers: {
          Accept: 'application/json',
          // Authorization: configure at query time
          // x-api-key: configure at query time
        },
      },
    },
  },

  // savings calculator configuration, estimate costs saved by using Adobe Checkout
  // default settings assume a $20/month student license and a 14-day checkout period
  // your mileage may vary

  savingsCalculator: {
    costPerUse: 20, // cost per license per month
    chargeAfterDays: 21,
    thirdCheckoutFreeWithin: 50,
    dirname: 'AdobeCreativeCloud', // ./logs/dailyStats/AdobeCreativeCloud
  },
};
