module.exports = {
  cryptoConfig: {
    secret: 'you should replace this with gibberish of your own',
    note: 'this is used to encrypt the user data in the logs',
  },
  admin: {
    onServer: false,
    server: {
      key: '/path/to/public_key.key',
      cert: '/path/to/certificate.crt',
      note: 'if onServer is true, you need to provide the key and cert paths',
    },
    port: 3010,
    requireLogin: true,
    allowedUsers: [], // list allowed emails here
    apiKey: 'writeYourOwnKeyHereTheValueIsNotImportant',
    hostname: 'localhost', // or 'your.hostname.edu'
    googleClientId:
      'get a google client id from https://console.developers.google.com/apis/credentials',
    googleClientSecret: 'get a google client secret from the same place',
    authCallback: 'http://localhost:3010/google/callback',
  },
  emailConverter: {
    active: false, // set to true to use the email converter, values below also need to be configured
    baseUrl: 'https://yourEmailConverterApi/?q=',
    endOfUrl: '', //any additional URL text to include after
    objectPropForReturnValue: 'data.uid', // response object property with the desired return value
    affixSuffixToReturn: true, // if converter returns only a userId and not an email, may need to be true
    suffix: '@miamioh.edu', // suffix to append to results of API if needed
  },
  database: {
    // database is only needed if using emailConverter
    active: false, // set to false to disable database connection, or true and setup db connection here
    use: 'test', // which of the following configs to use
    test: {
      connection:
        'mongodb://localhost:27017/softwareCheckout?appname=SoftwareCheckoutTest&ssl=false',
      config: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
    prod: {
      connection: '',
      config: {
        sslValidate: true,
        sslCA: 'ssl-cert.pem', // in certs folder
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
  },
  logLevels: {
    logLevels: {
      // false: not currently logging
      // 'monthly' for logfiles like error-2021-05
      // 'daily' for logfiles like debug-2021-05-01
      error: 'monthly',
      warn: false,
      info: 'monthly',
      http: false,
      verbose: false,
      debug: 'daily',
      silly: false,
    },
  },
  software: [
    {
      vendor: 'Adobe', // 'Adobe' and 'Jamf' are currently the only supported values
      vendorGroupName: 'MyLibrary Photoshop Patrons', // REPLACE WITH the Adobe User Mgmt User Group Name
      vendorGroupId: '123456789', // REPLACE WITH the Adobe User Mgmt User Group ID
      libCalName: 'Adobe Photoshop', // REPLACE WITH the LIbCal name for the product
      libCalCid: '12345', // REPLACE WITH the LIbCal CID for the product
      active: true,
      // you can add other fields here for your own use that don't affect the software checkout process
      // such as:
      // reservationUrl:
      //   'https://yourlib.libcal.com/reserve/LibrarySoftware/photoshop',
    },
    {
      vendor: 'Adobe', // 'Adobe' and 'Jamf' are currently the only supported values
      vendorGroupId: 'MyLibrary Illustrator Patrons', // REPLACE WITH the Adobe User Mgmt User Group Name
      vendorGroupId: '012345678', // REPLACE WITH the Adobe User Mgmt User Group ID
      libCalName: 'Adobe Illustrator', // REPLACE WITH the LIbCal name for the product
      libCalCid: '67890', // REPLACE WITH the LIbCal CID for the product
      active: false,
    },
    {
      vendor: 'Jamf', // 'Adobe' and 'Jamf' are currently the only supported values
      vendorGroupName: 'Logic Pro', // REPLACE WITH the Jamf User Group Name
      vendorGroupId: 8,
      libCalName: 'Logic Pro',
      libCalCid: '12345',
      active: true,
    },
  ],
};
